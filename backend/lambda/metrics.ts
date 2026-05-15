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

function toYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function getStageStartDate(intern: Record<string, unknown>): string | undefined {
  const stage = intern["Stage"] as string;
  if (stage === "Stage 3") return (intern["Stage 3 Promo Date"] ?? intern["Stage 2 Promo Date"] ?? intern["Start Date"]) as string | undefined;
  if (stage === "Stage 2") return (intern["Stage 2 Promo Date"] ?? intern["Start Date"]) as string | undefined;
  return intern["Start Date"] as string | undefined;
}

function computeRiskFlags(intern: Record<string, unknown>): string[] {
  const flags: string[] = [];
  const stage = intern["Stage"] as string;
  const thresholds = STAGE_THRESHOLDS[stage];
  const stageStart = getStageStartDate(intern);

  if (thresholds && stageStart) {
    const months = monthsBetween(stageStart);
    if (months > thresholds.red) flags.push("exceeding_dwell_time", "promotion_overdue");
  }
  if (!(intern["Mentor Contact"] as string)?.trim()) flags.push("no_mentor");
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

  const totalByStatus = groupCount(interns, (i) => (i["Program Status"] as string) ?? "Unknown");

  const byLocation = groupCount(
    interns.filter((i) => i["Program Status"] === "Active"),
    (i) => (i["Site Location"] as string) ?? "Unknown"
  );

  const joinersByMonth: Record<string, number> = {};
  for (const i of interns) {
    if (i["Start Date"]) {
      const k = toYearMonth(i["Start Date"] as string);
      joinersByMonth[k] = (joinersByMonth[k] ?? 0) + 1;
    }
  }

  const leaversByMonth: Record<string, number> = {};
  for (const i of interns) {
    const exitDate = i["Exit Date"] as string | undefined;
    if (!exitDate) continue;
    const k = toYearMonth(exitDate);
    leaversByMonth[k] = (leaversByMonth[k] ?? 0) + 1;
  }

  const allMonths = new Set([...Object.keys(joinersByMonth), ...Object.keys(leaversByMonth)]);
  const netGrowthByMonth = [...allMonths].sort().map((month) => ({
    month,
    net: (joinersByMonth[month] ?? 0) - (leaversByMonth[month] ?? 0),
  }));

  const timesInProgram = interns
    .map((i) => {
      if (!i["Start Date"]) return null;
      const end = i["Exit Date"] ? new Date(i["Exit Date"] as string) : now;
      return monthsBetween(i["Start Date"] as string, end);
    })
    .filter((t): t is number => t !== null);
  const avgTimeInProgramMonths =
    timesInProgram.length ? Math.round(timesInProgram.reduce((a, b) => a + b, 0) / timesInProgram.length) : 0;

  return {
    totalByStatus,
    byLocation,
    joinersByMonth: Object.entries(joinersByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    leaversByMonth: Object.entries(leaversByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
    netGrowthByMonth,
    avgTimeInProgramMonths,
  };
}

// ─── Performance Reviews ──────────────────────────────────────────────────────

function buildPerfReviewMetrics(interns: Record<string, unknown>[]) {
  const active = interns.filter((i) => i["Program Status"] === "Active");

  const byStage = groupCount(active, (i) => (i["Stage"] as string) ?? "Unknown");

  const stageTimings: Record<string, number[]> = {};
  for (const i of active) {
    const stage = i["Stage"] as string;
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
    const stageInterns = active.filter((i) => i["Stage"] === stage);
    dwellDistribution[stage] = { green: [], yellow: [], red: [] };
    for (const i of stageInterns) {
      const stageStart = getStageStartDate(i);
      const months = stageStart ? monthsBetween(stageStart) : 0;
      const bucket = months >= thresholds.red ? "red" : months >= thresholds.yellow ? "yellow" : "green";
      (dwellDistribution[stage][bucket] as unknown[]).push({
        "Employee ID": i["Employee ID"],
        "First and Last Name": i["First and Last Name"],
        monthsInStage: months,
      });
    }
  }

  const approachingPromotion = active.filter((i) => {
    const stage = i["Stage"] as string;
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
    flaggedInterns.push({ "Employee ID": i["Employee ID"], "First and Last Name": i["First and Last Name"], flags });
    if (flags.includes("exceeding_dwell_time")) riskCounts.exceedingDwellTime++;
    if (flags.includes("no_mentor")) riskCounts.noMentor++;
    if (flags.includes("mentor_changes")) riskCounts.mentorChanges++;
    if (flags.includes("promotion_overdue")) riskCounts.promotionOverdue++;
    if (flags.includes("at_risk")) riskCounts.atRisk++;
  }

  return {
    byStage,
    avgTimePerStage,
    dwellDistribution,
    approachingPromotion,
    riskSummary: { total: flaggedInterns.length, ...riskCounts, flaggedInterns },
  };
}

// ─── FTE Conversions ──────────────────────────────────────────────────────────

function buildFteMetrics(interns: Record<string, unknown>[]) {
  const currentYear = new Date().getFullYear().toString();
  const thisYearGrads = interns.filter((i) => i["Grad Date"] && (i["Grad Date"] as string).startsWith(currentYear));

  const graduatingByCohort = groupCount(thisYearGrads, (i) => {
    const month = new Date(i["Grad Date"] as string).getMonth();
    if (month === 4) return "May";
    if (month === 5) return "June";
    if (month === 11) return "December";
    return "Other";
  });

  const withOutcome = interns.filter((i) => i["Hiring Meeting Outcome"]);
  const inclineBreakdown = groupCount(withOutcome, (i) => i["Hiring Meeting Outcome"] as string);

  const offersExtended = interns.filter((i) => i["FTE Offer Status"] && i["FTE Offer Status"] !== "Not Extended");
  const offersAccepted = offersExtended.filter((i) => i["FTE Offer Status"] === "Accepted");
  const offerAcceptance = {
    extended: offersExtended.length,
    accepted: offersAccepted.length,
    rate: offersExtended.length ? Math.round((offersAccepted.length / offersExtended.length) * 100) : 0,
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingHiringMeetings = interns
    .filter((i) => i["Hiring Meeting Date"] && (i["Hiring Meeting Date"] as string) >= today && !i["Hiring Meeting Outcome"])
    .sort((a, b) => (a["Hiring Meeting Date"] as string).localeCompare(b["Hiring Meeting Date"] as string))
    .map((i) => ({
      "Employee ID": i["Employee ID"],
      "First and Last Name": i["First and Last Name"],
      "Hiring Meeting Date": i["Hiring Meeting Date"],
      "Stage": i["Stage"],
      "Mentor Contact": i["Mentor Contact"],
      "Mentor Email": i["Mentor Email"],
      "Manager Contact": i["Manager Contact"],
      "Manager Email": i["Manager Email"],
    }));

  return {
    graduatingByCohort,
    inclineBreakdown,
    offerAcceptance,
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
