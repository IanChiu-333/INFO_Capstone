import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import { usePerformanceReviews } from '../hooks/usePerformanceReviews';
import type { PerformanceReview } from '../services';

export default function PerformanceReviews() {
  const { reviews, loading } = usePerformanceReviews();

  if (loading) return null;

  return (
    <Table
      header={
        <Header
          variant="h2"
          description="Scheduled and completed reviews for the current cycle"
          counter={`(${reviews.length} Total)`}
        >
          Performance Reviews
        </Header>
      }
      columnDefinitions={[
        { id: 'internName',    header: 'Intern Name',     cell: (r: PerformanceReview) => r.internName },
        { id: 'manager',       header: 'Manager',         cell: (r: PerformanceReview) => r.manager },
        { id: 'scheduledDate', header: 'Scheduled Date',  cell: (r: PerformanceReview) => r.scheduledDate },
        { id: 'completedDate', header: 'Completed Date',  cell: (r: PerformanceReview) => r.completedDate ?? '—' },
        { id: 'status',        header: 'Status',          cell: (r: PerformanceReview) => r.status },
        { id: 'rating',        header: 'Rating',          cell: (r: PerformanceReview) => r.rating != null ? `${r.rating} / 5` : '—' },
      ]}
      items={reviews}
      empty={<Box textAlign="center">No reviews found.</Box>}
    />
  );
}
