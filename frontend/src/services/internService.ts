import type {
  Intern,
  PerformanceReview,
  FTEConversionRecord,
  ProgramMetrics,
  ActionItem,
  EnrollmentDataPoint,
  StageDistribution,
} from './types';
import {
  computeMetrics,
  computeActionItems,
  computeEnrollmentTrend,
  computeStageDistribution,
} from './aggregations';
import {
  MOCK_INTERNS,
  MOCK_PERFORMANCE_REVIEWS,
  MOCK_FTE_CONVERSIONS,
} from './mockData';

export interface InternService {
  getInterns(): Promise<Intern[]>;
  getIntern(id: string): Promise<Intern | null>;
  getMetrics(): Promise<ProgramMetrics>;
  getActionItems(): Promise<ActionItem[]>;
  getEnrollmentTrend(): Promise<EnrollmentDataPoint[]>;
  getStageDistribution(): Promise<StageDistribution[]>;
  getPerformanceReviews(): Promise<PerformanceReview[]>;
  getFTEConversions(): Promise<FTEConversionRecord[]>;
}

export const mockInternService: InternService = {
  getInterns: () => Promise.resolve(MOCK_INTERNS),

  getIntern: (id) =>
    Promise.resolve(MOCK_INTERNS.find(i => i.id === id) ?? null),

  getMetrics: () =>
    Promise.resolve(computeMetrics(MOCK_INTERNS)),

  getActionItems: () =>
    Promise.resolve(computeActionItems(MOCK_INTERNS)),

  getEnrollmentTrend: () =>
    Promise.resolve(computeEnrollmentTrend(MOCK_INTERNS)),

  getStageDistribution: () =>
    Promise.resolve(computeStageDistribution(MOCK_INTERNS)),

  getPerformanceReviews: () =>
    Promise.resolve(MOCK_PERFORMANCE_REVIEWS),

  getFTEConversions: () =>
    Promise.resolve(MOCK_FTE_CONVERSIONS),
};
