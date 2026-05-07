import { useMemo } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { useInterns }  from '../hooks/useInterns';
import { useMetrics }  from '../hooks/useMetrics';
import { computeEnrollmentTrend } from '../services';

import MetricsGrid          from '../components/metrics/MetricsGrid';
import EnrollmentTrendChart from '../components/charts/EnrollmentTrendChart';
import InternsTable         from '../components/interns/InternsTable';

export default function ProgramOverview() {
  const { interns, loading: internsLoading } = useInterns();
  const { metrics }                          = useMetrics();

  const enrollmentData = useMemo(() => computeEnrollmentTrend(interns), [interns]);

  const locationCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const intern of interns) {
      if (intern.programStatus === 'Active') {
        counts[intern.location] = (counts[intern.location] ?? 0) + 1;
      }
    }
    return counts;
  }, [interns]);

  if (internsLoading || !metrics) return null;

  return (
    <SpaceBetween size="l">

      {/* 4×2 metric cards — no section header per new design */}
      <MetricsGrid metrics={metrics} locationCounts={locationCounts} />

      {/* Net Program Growth */}
      <Container
        header={
          <Header variant="h2" description="Total active interns over time">
            Net Program Growth
          </Header>
        }
      >
        <EnrollmentTrendChart data={enrollmentData} />
      </Container>

      {/* All Active Interns */}
      <InternsTable interns={interns} />

    </SpaceBetween>
  );
}
