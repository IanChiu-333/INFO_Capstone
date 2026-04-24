import type { Intern, PerformanceReview, FTEConversionRecord } from './types';

const FIRST_NAMES = [
  'Sarah','Michael','Emily','David','Jessica','Ryan','Alex','Maria','James','Ashley',
  'Daniel','Megan','Kevin','Rachel','Justin','Lauren','Tyler','Amanda','Andrew','Stephanie',
  'Brandon','Nicole','Nathan','Heather','Kyle','Amber','Eric','Brittany','Jacob','Crystal',
];
const LAST_NAMES = [
  'Chen','Torres','Johnson','Kim','Martinez','Patel','Zhang','Lopez','Wilson','Anderson',
  'Taylor','Brown','Garcia','Davis','Rodriguez','Lewis','Lee','Walker','Hall','Young',
  'Allen','Hernandez','King','Wright','Scott','Green','Adams','Baker','Nelson','Carter',
];
const MANAGERS = ['Manager A','Manager B','Manager C','Manager D','Manager E'];
const LOCATIONS = ['Seattle','San Francisco','Austin','New York','Boston','Chicago'];
const STAGES = ['Stage 1','Stage 2','Stage 3','Stage 4'] as const;

// Exact counts per stage so stage distribution matches Figma proportions (total = 148)
const STAGE_QUOTAS: Record<string, number> = {
  'Stage 1': 42,
  'Stage 2': 38,
  'Stage 3': 36,
  'Stage 4': 32,
};

function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function addMonthsToIso(iso: string, months: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().split('T')[0];
}

export const MOCK_INTERNS: Intern[] = (() => {
  const result: Intern[] = [];
  let idx = 0;

  for (const stage of STAGES) {
    const quota = STAGE_QUOTAS[stage];
    for (let i = 0; i < quota; i++) {
      // Start dates spread Jun 2025 – Feb 2026 (9-month window)
      const offset = idx % 9; // 0=Jun25 … 6=Dec25, 7=Jan26, 8=Feb26
      const startYear  = offset <= 6 ? 2025 : 2026;
      const startMonth = offset <= 6 ? 6 + offset : offset - 6;
      const startDay   = (idx % 20) + 1;
      const startDate  = isoDate(startYear, startMonth, startDay);

      // Duration 12–15 months so most are still active in Apr 2026
      const durationMonths = 12 + (idx % 4);
      const graduationDate = addMonthsToIso(startDate, durationMonths);

      const inclinedOptions = ['Yes', 'No', 'Pending'] as const;
      const inclinedStatus  = inclinedOptions[idx % 3];

      // ~20% missing hiring meeting (every 5th intern)
      const hiringMeetingScheduled = idx % 5 !== 0;

      // Inclined with no offer extended: Yes + null (every 4th inclined-Yes)
      const offerExtendedDate =
        inclinedStatus === 'Yes' && idx % 4 === 0
          ? null
          : inclinedStatus === 'Yes'
          ? addMonthsToIso(startDate, 6)
          : null;

      // ~12% no headcount source
      const headcountSource = idx % 8 === 0 ? null : `HC-${1000 + idx}`;

      // Stage dwell 20–119 days; those > 90 trigger the action item
      const stageDwellDays = 20 + (idx % 100);

      result.push({
        id: `intern-${idx + 1}`,
        name: `${FIRST_NAMES[(idx * 7) % FIRST_NAMES.length]} ${LAST_NAMES[(idx * 11) % LAST_NAMES.length]}`,
        manager: MANAGERS[idx % MANAGERS.length],
        location: LOCATIONS[idx % LOCATIONS.length],
        stage,
        startDate,
        graduationDate,
        inclinedStatus,
        status: 'Active',
        hiringMeetingScheduled,
        offerExtendedDate,
        headcountSource,
        stageDwellDays,
      });

      idx++;
    }
  }

  return result;
})();

export const MOCK_PERFORMANCE_REVIEWS: PerformanceReview[] = MOCK_INTERNS
  .slice(0, 60)
  .map((intern, i) => ({
    id: `review-${i + 1}`,
    internId: intern.id,
    internName: intern.name,
    manager: intern.manager,
    scheduledDate: addMonthsToIso(intern.startDate, 3 + (i % 3)),
    completedDate: i % 3 === 0 ? null : addMonthsToIso(intern.startDate, 3 + (i % 3)),
    status: (['Completed','Scheduled','Overdue','Pending'] as const)[i % 4],
    rating: i % 3 === 0 ? null : 2 + (i % 4),
    notes: i % 3 === 0 ? '' : 'Review completed with manager.',
  }));

export const MOCK_FTE_CONVERSIONS: FTEConversionRecord[] = MOCK_INTERNS
  .filter(intern => intern.inclinedStatus === 'Yes')
  .map((intern, i) => ({
    id: `fte-${i + 1}`,
    internId: intern.id,
    internName: intern.name,
    manager: intern.manager,
    location: intern.location,
    graduationDate: intern.graduationDate,
    conversionStatus: (['Converted','Pending','Declined','No Offer'] as const)[i % 4],
    offerDate: intern.offerExtendedDate,
    startDateFTE: i % 4 === 0 ? null : addMonthsToIso(intern.graduationDate, 1),
    headcountSource: intern.headcountSource,
  }));
