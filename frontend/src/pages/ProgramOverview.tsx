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

const KNOWN_LOCATIONS = [
  'ATL11','AUS13','DTW10','JFK27','MAD12','MAD15','MRY11','PDX17',
  'SAN13','SAN21','SBA11','SBP1','SBP10','SBP12','SEA22','SEA24',
  'SEA26','SEA76','SEA94','SJC13','YVR26','YYJ1',
];

export default function ProgramOverview() {
  const { interns, loading: internsLoading, addIntern, updateIntern, deleteIntern } = useInterns();
  const { metrics }                          = useMetrics();

  const enrollmentData = useMemo(() => computeEnrollmentTrend(interns), [interns]);

  const locationCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = Object.fromEntries(
      KNOWN_LOCATIONS.map(loc => [loc, 0])
    );
    for (const intern of interns) {
      if (intern.programStatus === 'Active' && intern.location in counts) {
        counts[intern.location] += 1;
      }
    }
    return counts;
  }, [interns]);

  const costCenterCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const intern of interns) {
      if (intern.programStatus === 'Active' && intern.costCenter) {
        counts[intern.costCenter] = (counts[intern.costCenter] ?? 0) + 1;
      }
    }
    return counts;
  }, [interns]);

  if (internsLoading || !metrics) return null;

  return (
    <SpaceBetween size="l">

      {/* 4×2 metric cards — no section header per new design */}
      <MetricsGrid metrics={metrics} locationCounts={locationCounts} costCenterCounts={costCenterCounts} />

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

      {/* All Interns */}
      <InternsTable
        interns={interns}
        onAdd={addIntern}
        onUpdate={updateIntern}
        onDelete={deleteIntern}
      />

    </SpaceBetween>
  );
}
