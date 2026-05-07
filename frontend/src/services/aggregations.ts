import type {
  Intern,
  ProgramMetrics,
  ActionItem,
  EnrollmentDataPoint,
  StageDistribution,
} from './types';

const MONTH_INDEX: Record<string, number> = {
  Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12,
};
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function computeStageDistribution(interns: Intern[]): StageDistribution[] {
  const counts: Record<string, number> = {};
  for (const intern of interns) {
    counts[intern.stage] = (counts[intern.stage] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([stage, count]) => ({ stage, count }));
}

export function computeEnrollmentTrend(
  interns: Intern[],
  months: string[] = ['Jan','Feb','Mar','Apr','May','Jun'],
  referenceYear = 2026,
): EnrollmentDataPoint[] {
  return months.map(abbr => {
    const m = MONTH_INDEX[abbr];
    const monthStart = new Date(`${referenceYear}-${String(m).padStart(2,'0')}-01T00:00:00Z`);
    const count = interns.filter(intern => {
      const start = new Date(intern.startDate + 'T00:00:00Z');
      const grad  = new Date(intern.expectedGraduationDate + 'T00:00:00Z');
      return start <= monthStart && grad > monthStart;
    }).length;
    return { month: abbr, count };
  });
}

export function computeMetrics(interns: Intern[]): ProgramMetrics {
  const active = interns.filter(i => i.programStatus === 'Active');

  const seasonMonths = ['2026-05','2026-06','2026-12'];
  const graduatingThisSeason = active.filter(i =>
    seasonMonths.some(m => i.expectedGraduationDate.startsWith(m))
  ).length;

  const graduatingByMonth = ['May','Jun','Dec'].map(abbr => ({
    month: abbr,
    count: active.filter(i => {
      const d = new Date(i.expectedGraduationDate + 'T00:00:00Z');
      return MONTH_ABBR[d.getUTCMonth()] === abbr;
    }).length,
  }));

  const durations = active.map(i => {
    const start = new Date(i.startDate + 'T00:00:00Z');
    const grad  = new Date(i.expectedGraduationDate + 'T00:00:00Z');
    return (grad.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  });
  const avgDuration = durations.length
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  const inclinedCount = active.filter(i => i.inclinedStatus === 'Yes').length;
  const conversionRate = active.length
    ? Math.round((inclinedCount / active.length) * 100)
    : 0;

  // joiningThisMonth: interns whose startDate falls in the current calendar month
  const now = new Date();
  const currentYYYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const joiningThisMonth = active.filter(i => i.startDate.startsWith(currentYYYYMM)).length;

  // leavingPerMonth: avg interns whose expectedGraduationDate falls in any of the last 6 months
  const recentMonths = Array.from({ length: 6 }, (_, k) => {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const leavingPerMonth = Math.round(
    interns.filter(i => recentMonths.some(m => i.expectedGraduationDate.startsWith(m))).length / 6,
  );

  return {
    totalActiveInterns: active.length,
    totalActiveDelta: 5,              // requires historical comparison — static for mock
    graduatingThisSeason,
    graduatingDeltaPct: 12,           // requires historical comparison — static for mock
    graduatingByMonth,
    overallConversionRate: conversionRate,
    conversionDeltaPct: 3,            // requires historical comparison — static for mock
    avgProgramDurationMonths: Math.round(avgDuration * 10) / 10,
    avgDurationDeltaMonths: -0.3,     // requires historical comparison — static for mock
    joiningThisMonth,
    joiningDeltaPct: 3,               // requires historical comparison — static for mock
    leavingPerMonth,
    leavingDeltaPct: -2,              // requires historical comparison — static for mock
    postProgramRetentionRate: 84,     // requires historical data — static for mock
    retentionDeltaPct: -2,            // requires historical comparison — static for mock
  };
}

export function computeActionItems(
  interns: Intern[],
  referenceDate: Date = new Date(),
): ActionItem[] {
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(referenceDate.getTime() + NINETY_DAYS_MS);
  const active = interns.filter(i => i.programStatus === 'Active');

  const graduatingSoon = active.filter(i => {
    const grad = new Date(i.expectedGraduationDate + 'T00:00:00Z');
    return grad > referenceDate && grad <= cutoff;
  });

  const hasNoHiringMeeting = (i: Intern) => !i.hiringMeetingDate && !i.hiringMeetingUpcomingDate;

  const dwellDays = (i: Intern) => {
    const stageStart = i.lastPromotionDate ?? i.startDate;
    return Math.floor((referenceDate.getTime() - new Date(stageStart + 'T00:00:00Z').getTime()) / (1000 * 60 * 60 * 24));
  };

  return [
    {
      id: 'missing-hiring-meetings',
      count: graduatingSoon.filter(hasNoHiringMeeting).length,
      title: 'Missing Hiring Meetings',
      description: 'Interns graduating in <90 days without hiring meeting scheduled',
      severity: 'critical',
    },
    {
      id: 'inclined-without-offer',
      count: active.filter(i => i.inclinedStatus === 'Yes' && i.offerExtendedDate === null).length,
      title: 'Inclined Without Offer',
      description: 'Inclined candidates without offer extended >7 days',
      severity: 'critical',
    },
    {
      id: 'stage-dwell-threshold',
      count: active.filter(i => dwellDays(i) > 90).length,
      title: 'Stage Dwell Threshold',
      description: 'Interns exceeding recommended stage dwell time',
      severity: 'warning',
    },
    {
      id: 'no-hc-source',
      count: graduatingSoon.filter(i => i.headcountSource === null).length,
      title: 'No HC Source',
      description: 'Graduating <90 days without confirmed headcount source',
      severity: 'warning',
    },
  ];
}
