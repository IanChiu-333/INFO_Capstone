import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

const STAGE_THRESHOLDS: Record<string, { yellow: number; red: number }> = {
  "Stage 1": { yellow: 10, red: 12 },
  "Stage 2": { yellow: 10, red: 12 },
  "Stage 3": { yellow: 15, red: 18 },
};

function ok(body: unknown): APIGatewayProxyResult {
  return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) };
}
function err(code: number, msg: string): APIGatewayProxyResult {
  return { statusCode: code, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: msg }) };
}

function monthsBetween(dateStr: string, toDate = new Date()): number {
  const d = new Date(dateStr);
  return (toDate.getFullYear() - d.getFullYear()) * 12 + (toDate.getMonth() - d.getMonth());
}

function daysBetween(from: string, to?: string): number {
  const a = new Date(from);
  const b = to ? new Date(to) : new Date();
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function toYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

function getStageStartDate(intern: Record<string, unknown>): string | undefined {
  const stage = intern.stage as string;
  if (stage === "Stage 3") return (intern.stage3PromoDate ?? intern.stage2PromoDate ?? intern.startDate) as string | undefined;
  if (stage === "Stage 2") return (intern.stage2PromoDate ?? intern.startDate) as string | undefined;
  return intern.startDate as string | undefined;
}

function computeRiskFlags(intern: Record<string, unknown>): string[] {
  const flags: string[] = [];
  const stage = intern.stage as string;
  const thresholds = STAGE_THRESHOLDS[stage];
  const stageStart = getStageStartDate(intern);

  if (thresholds && stageStart) {
    const months = monthsBetween(stageStart);
    if (months > thresholds.red) flags.push("exceeding_dwell_time", "promotion_overdue");
  }
  if (!(intern.mentorContact as string)?.trim()) flags.push("no_mentor");
  const log = intern.mentorChangeLog as unknown[];
  if (Array.isArray(log) && log.length >= 2) flags.push("mentor_changes");
  if (flags.length >= 2) flags.push("at_risk");
  return [...new Set(flags)];
}

async function getAllInterns(): Promise<Record<string, unknown>[]> {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  return (result.Items ?? []) as Record<string, unknown>[];
}

function groupCount<T>(items: T[], key: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}

// ─── Overview ────────────────────────────────────────────────────────────────

function buildOverviewMetrics(interns: Record<string, unknown>[]) {
  const now = new Date();

  const totalByStatus = groupCount(interns, (i) => (i.programStatus as string) ?? "Unknown");

  const byLocation = groupCount(
    interns.filter((i) => i.programStatus === "Active"),
    (i) => (i.siteLocation as string) ?? "Unknown"
  );

  const joinersByMonth: Record<string, number> = {};
  for (const i of interns) {
    if (i.startDate) {
      const k = toYearMonth(i.startDate as string);
      joinersByMonth[k] = (joinersByMonth[k] ?? 0) + 1;
    }
  }

  const leaversByMonth: Record<string, Record<string, number>> = {};
  for (const i of interns) {
    const exitDate = i.exitDate as string | undefined;
    if (!exitDate) continue;
    const k = toYearMonth(exitDate);
    if (!leaversByMonth[k]) leaversByMonth[k] = {};
    const isRegretted = i.regrettedExit === "Yes";
    const status = i.programStatus as string;
    const bucket =
      status === "Graduated" ? "Graduated" : isRegretted ? "Early Exit - Regretted" : "Early Exit - Unregretted";
    leaversByMonth[k][bucket] = (leaversByMonth[k][bucket] ?? 0) + 1;
  }

  const exits = interns.filter((i) => i.programStatus === "Early Exit");
  const regretted = exits.filter((i) => i.regrettedExit === "Yes").length;
  const unregretted = exits.filter((i) => i.regrettedExit !== "Yes").length;
  const totalExits = exits.length || 1;

  const allMonths = new Set([...Object.keys(joinersByMonth), ...Object.keys(leaversByMonth)]);
  const netGrowthByMonth = [...allMonths].sort().map((month) => ({
    month,
    net: (joinersByMonth[month] ?? 0) - Object.values(leaversByMonth[month] ?? {}).reduce((a, b) => a + b, 0),
  }));

  const timesInProgram = interns
    .map((i) => {
      if (!i.startDate) return null;
      const end = i.exitDate ? new Date(i.exitDate as string) : now;
      return monthsBetween(i.startDate as string, end);
    })
    .filter((t): t is number => t !== null);
  const avgTimeInProgramMonths =
    timesInProgram.length ? Math.round(timesInProgram.reduce((a, b) => a + b, 0) / timesInProgram.length) : 0;

  const graduated = interns.filter((i) => i.programStatus === "Graduated");
  const stillAtCompany = graduated.filter((i) => i.postProgramStatus === "Active FTE");

  // Avg months from startDate to Stage 3 (highest promotion) for L5/L6 interns
  const l5 = interns.filter((i) => (i.currentLevel === "L5" || i.currentLevel === "L6") && i.startDate && i.stage3PromoDate);
  const avgMonthsToPromotion =
    l5.length
      ? Math.round(l5.reduce((a, i) => a + monthsBetween(i.startDate as string, new Date(i.stage3PromoDate as string)), 0) / l5.length)
      : null;

  return {
    totalByStatus,
    byLocation,
    joinersByMonth: Object.entries(joinersByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    leaversByMonth: Object.entries(leaversByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, breakdown]) => ({ month, ...breakdown })),
    regrettedAttrition: { count: regretted, percentage: Math.round((regretted / totalExits) * 100) },
    unregrettedAttrition: { count: unregretted, percentage: Math.round((unregretted / totalExits) * 100) },
    netGrowthByMonth,
    avgTimeInProgramMonths,
    postProgramRetention: {
      retained: stillAtCompany.length,
      total: graduated.length,
      percentage: graduated.length ? Math.round((stillAtCompany.length / graduated.length) * 100) : 0,
    },
    promotionTimeline: { avgMonthsToPromotion },
  };
}

// ─── Performance Reviews ──────────────────────────────────────────────────────

function buildPerfReviewMetrics(interns: Record<string, unknown>[]) {
  const active = interns.filter((i) => i.programStatus === "Active");

  const byStage = groupCount(active, (i) => (i.stage as string) ?? "Unknown");

  const stageTimings: Record<string, number[]> = {};
  for (const i of active) {
    const stage = i.stage as string;
    const stageStart = getStageStartDate(i);
    if (stage && stageStart) {
      if (!stageTimings[stage]) stageTimings[stage] = [];
      stageTimings[stage].push(monthsBetween(stageStart));
    }
  }
  const avgTimePerStage = Object.fromEntries(
    Object.entries(stageTimings).map(([s, times]) => [
      s,
      Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    ])
  );

  const dwellDistribution: Record<string, { green: unknown[]; yellow: unknown[]; red: unknown[] }> = {};
  for (const stage of ["Stage 1", "Stage 2", "Stage 3"]) {
    const thresholds = STAGE_THRESHOLDS[stage];
    const stageInterns = active.filter((i) => i.stage === stage);
    dwellDistribution[stage] = { green: [], yellow: [], red: [] };
    for (const i of stageInterns) {
      const stageStart = getStageStartDate(i);
      const months = stageStart ? monthsBetween(stageStart) : 0;
      const bucket = months >= thresholds.red ? "red" : months >= thresholds.yellow ? "yellow" : "green";
      (dwellDistribution[stage][bucket] as unknown[]).push({ employeeId: i.employeeId, firstAndLastName: i.firstAndLastName, monthsInStage: months });
    }
  }

  const approachingPromotion = active.filter((i) => {
    const stage = i.stage as string;
    const thresholds = STAGE_THRESHOLDS[stage];
    if (!thresholds) return false;
    const stageStart = getStageStartDate(i);
    if (!stageStart) return false;
    const months = monthsBetween(stageStart);
    return months >= thresholds.yellow - 2 && months < thresholds.red;
  });

  const riskCounts = { exceedingDwellTime: 0, noMentor: 0, mentorChanges: 0, promotionOverdue: 0, atRisk: 0 };
  const flaggedInterns: unknown[] = [];
  for (const i of active) {
    const flags = computeRiskFlags(i);
    if (!flags.length) continue;
    flaggedInterns.push({ employeeId: i.employeeId, firstAndLastName: i.firstAndLastName, flags });
    if (flags.includes("exceeding_dwell_time")) riskCounts.exceedingDwellTime++;
    if (flags.includes("no_mentor")) riskCounts.noMentor++;
    if (flags.includes("mentor_changes")) riskCounts.mentorChanges++;
    if (flags.includes("promotion_overdue")) riskCounts.promotionOverdue++;
    if (flags.includes("at_risk")) riskCounts.atRisk++;
  }

  const mayEligible = interns.filter((i) => i.reviewEligibilityMay === "Yes");
  const octEligible = interns.filter((i) => i.reviewEligibilityOctober === "Yes");

  return {
    byStage,
    avgTimePerStage,
    dwellDistribution,
    approachingPromotion,
    riskSummary: { total: flaggedInterns.length, ...riskCounts, flaggedInterns },
    reviewEligibility: {
      may: { count: mayEligible.length, interns: mayEligible },
      october: { count: octEligible.length, interns: octEligible },
    },
  };
}

// ─── FTE Conversions ──────────────────────────────────────────────────────────

function buildFteMetrics(interns: Record<string, unknown>[]) {
  const graduating = interns.filter((i) => i.gradDate);
  const currentYear = new Date().getFullYear().toString();
  const thisYearGrads = graduating.filter((i) => (i.gradDate as string).startsWith(currentYear));

  const graduatingByCohort = groupCount(thisYearGrads, (i) => (i.graduationCohort as string) ?? "Unknown");

  const withBothDates = interns.filter((i) => i.hiringMeetingDate && i.offerExtendedDate);
  const avgDaysByAll =
    withBothDates.length
      ? Math.round(withBothDates.reduce((a, i) => a + daysBetween(i.hiringMeetingDate as string, i.offerExtendedDate as string), 0) / withBothDates.length)
      : null;

  const avgDaysByCohort: Record<string, number | null> = {};
  for (const cohort of ["May", "June", "December"]) {
    const cohortInterns = withBothDates.filter((i) => i.graduationCohort === cohort);
    avgDaysByCohort[cohort] = cohortInterns.length
      ? Math.round(cohortInterns.reduce((a, i) => a + daysBetween(i.hiringMeetingDate as string, i.offerExtendedDate as string), 0) / cohortInterns.length)
      : null;
  }

  const withOutcome = interns.filter((i) => i.hiringMeetingOutcome);
  const inclineBreakdown = groupCount(withOutcome, (i) => i.hiringMeetingOutcome as string);

  const offersExtended = interns.filter((i) => i.offerExtendedDate);
  const offersAccepted = offersExtended.filter((i) => i.offerAccepted === "Yes");
  const offerAcceptance = {
    extended: offersExtended.length,
    accepted: offersAccepted.length,
    rate: offersExtended.length ? Math.round((offersAccepted.length / offersExtended.length) * 100) : 0,
  };

  const offerReadyPage = interns
    .filter((i) => i.dateAddedToOfferReadyWikiPage)
    .map((i) => {
      const daysOnPage = daysBetween(i.dateAddedToOfferReadyWikiPage as string, i.dateRemovedFromOfferReadyWikiPage as string | undefined);
      const colorCode = daysOnPage > 30 ? "red" : daysOnPage > 14 ? "yellow" : "green";
      return {
        employeeId: i.employeeId,
        firstAndLastName: i.firstAndLastName,
        dateAdded: i.dateAddedToOfferReadyWikiPage,
        dateRemoved: i.dateRemovedFromOfferReadyWikiPage ?? null,
        daysOnPage,
        status: i.fteOfferStatus ?? "Active",
        colorCode,
      };
    })
    .sort((a, b) => b.daysOnPage - a.daysOnPage);

  const avgDaysOnOfferReadyPage = offerReadyPage.length
    ? Math.round(offerReadyPage.reduce((a, i) => a + i.daysOnPage, 0) / offerReadyPage.length)
    : null;

  const today = new Date().toISOString().split("T")[0];
  const upcomingHiringMeetings = interns
    .filter((i) => i.hiringMeetingDate && (i.hiringMeetingDate as string) >= today && !i.hiringMeetingOutcome)
    .sort((a, b) => (a.hiringMeetingDate as string).localeCompare(b.hiringMeetingDate as string))
    .map((i) => ({
      employeeId: i.employeeId,
      firstAndLastName: i.firstAndLastName,
      hiringMeetingDate: i.hiringMeetingDate,
      stage: i.stage,
      mentorContact: i.mentorContact,
      mentorEmail: i.mentorEmail,
      managerContact: i.managerContact,
      managerEmail: i.managerEmail,
      notes: i.notes ?? "",
    }));

  return {
    graduatingByCohort,
    avgDaysHiringToOffer: { overall: avgDaysByAll, byCohort: avgDaysByCohort },
    inclineBreakdown,
    offerAcceptance,
    offerReadyPage: { avgDaysOnPage: avgDaysOnOfferReadyPage, interns: offerReadyPage },
    upcomingHiringMeetings,
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const resource = event.resource;

  try {
    const interns = await getAllInterns();

    if (resource === "/metrics/overview") return ok(buildOverviewMetrics(interns));
    if (resource === "/metrics/performance-reviews") return ok(buildPerfReviewMetrics(interns));
    if (resource === "/metrics/fte-conversions") return ok(buildFteMetrics(interns));

    return err(404, "Unknown metrics route");
  } catch (e) {
    console.error(e);
    return err(500, "Internal server error");
  }
}
