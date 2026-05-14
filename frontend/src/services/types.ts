export type InternStage = 'Stage 1' | 'Stage 2' | 'Stage 3' | 'Stage 4';
export type InclinedStatus = 'Yes' | 'No' | 'Pending';
export type ProgramStatus = 'Active' | 'Graduated' | 'Early Exit';
export type ReviewStatus = 'Scheduled' | 'Completed' | 'Overdue' | 'Pending';
export type ConversionStatus = 'Converted' | 'Pending' | 'Declined' | 'No Offer';
export type ActionSeverity = 'critical' | 'warning';

export interface Intern {
  internId: string;
  internName: string;
  managerName: string;
  l8: string;                           // Skip-level (L8) manager
  location: string;
  stage: InternStage;
  startDate: string;                    // ISO date: YYYY-MM-DD
  expectedGraduationDate: string;       // ISO date: YYYY-MM-DD
  costCenter: string;
  inclinedStatus: InclinedStatus;
  programStatus: ProgramStatus;
  hiringMeetingDate?: string;           // ISO date — past meeting
  hiringMeetingUpcomingDate?: string;   // ISO date — scheduled future meeting
  offerExtendedDate: string | null;     // ISO date or null
  headcountSource: string | null;
  lastPromotionDate?: string;           // ISO date: YYYY-MM-DD
}

export interface PerformanceReview {
  id: string;
  internId: string;
  internName: string;
  manager: string;
  scheduledDate: string;
  completedDate: string | null;
  status: ReviewStatus;
  rating: number | null;           // 1–5
  notes: string;
}

export interface FTEConversionRecord {
  id: string;
  internId: string;
  internName: string;
  manager: string;
  location: string;
  graduationDate: string;
  conversionStatus: ConversionStatus;
  offerDate: string | null;
  startDateFTE: string | null;
  headcountSource: string | null;
}

export interface ProgramMetrics {
  totalActiveInterns: number;
  totalActiveDelta: number;
  graduatingThisSeason: number;
  graduatingDeltaPct: number;
  graduatingByMonth: Array<{ month: string; count: number }>;
  overallConversionRate: number;
  conversionDeltaPct: number;
  avgProgramDurationMonths: number;
  avgDurationDeltaMonths: number;
  // Fields added for updated Program Overview design
  joiningThisMonth: number;
  joiningDeltaPct: number;
  leavingPerMonth: number;
  leavingDeltaPct: number;
  postProgramRetentionRate: number;
  retentionDeltaPct: number;
}

export interface ActionItem {
  id: string;
  count: number;
  title: string;
  description: string;
  severity: ActionSeverity;
}

export interface EnrollmentDataPoint {
  month: string;  // 'Jan', 'Feb', etc.
  count: number;
}

export interface StageDistribution {
  stage: string;
  count: number;
}
