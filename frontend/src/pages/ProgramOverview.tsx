import { useMemo } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
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

  // Chart data derived from the same intern array that feeds the table
  const enrollmentData = useMemo(() => computeEnrollmentTrend(interns), [interns]);

  // Location breakdown for the Location dropdown card — derived from interns
  const locationCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const intern of interns) {
      if (intern.status === 'Active') {
        counts[intern.location] = (counts[intern.location] ?? 0) + 1;
      }
    }
    return counts;
  }, [interns]);

  if (internsLoading || !metrics) return null;

  return (
    <SpaceBetween size="l">

      {/* Program Health Metrics — 2 rows × 4 cards */}
      <Container
        header={
          <Header
            variant="h2"
            description="Overall program status as of March 3, 2026"
            actions={<Button variant="primary" iconName="download">Export Report</Button>}
          >
            Program Health Metrics
          </Header>
        }
      >
        <MetricsGrid metrics={metrics} locationCounts={locationCounts} />
      </Container>

      {/* Net Program Growth — full-width line chart */}
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
