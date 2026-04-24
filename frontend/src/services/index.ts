export type {
  Intern,
  PerformanceReview,
  FTEConversionRecord,
  ProgramMetrics,
  ActionItem,
  EnrollmentDataPoint,
  StageDistribution,
  InternStage,
  InclinedStatus,
  InternStatus,
  ReviewStatus,
  ConversionStatus,
  ActionSeverity,
} from './types';

export type { InternService } from './internService';
export { mockInternService } from './internService';
export * from './aggregations';

// ─── Swap this one line to connect a real backend ───────────────────────────
// import { graphInternService } from './graphInternService';
import { mockInternService } from './internService';
export const internService = mockInternService;
// ────────────────────────────────────────────────────────────────────────────
