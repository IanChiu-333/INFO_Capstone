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
  addIntern(intern: Intern): Promise<Intern>;
  updateIntern(intern: Intern): Promise<Intern>;
  deleteIntern(id: string): Promise<void>;
  getMetrics(): Promise<ProgramMetrics>;
  getActionItems(): Promise<ActionItem[]>;
  getEnrollmentTrend(): Promise<EnrollmentDataPoint[]>;
  getStageDistribution(): Promise<StageDistribution[]>;
  getPerformanceReviews(): Promise<PerformanceReview[]>;
  getFTEConversions(): Promise<FTEConversionRecord[]>;
}

let mockInternsState = [...MOCK_INTERNS];

export const mockInternService: InternService = {
  getInterns: () => Promise.resolve([...mockInternsState]),

  getIntern: (id) =>
    Promise.resolve(mockInternsState.find(i => i.internId === id) ?? null),

  addIntern: (intern) => {
    mockInternsState = [intern, ...mockInternsState];
    return Promise.resolve(intern);
  },

  updateIntern: (intern) => {
    mockInternsState = mockInternsState.map(i => i.internId === intern.internId ? intern : i);
    return Promise.resolve(intern);
  },

  deleteIntern: (id) => {
    mockInternsState = mockInternsState.filter(i => i.internId !== id);
    return Promise.resolve();
  },

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
