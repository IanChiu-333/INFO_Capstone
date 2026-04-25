import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import type { TableProps } from '@cloudscape-design/components/table';
import Pagination from '@cloudscape-design/components/pagination';
import Icon from '@cloudscape-design/components/icon';

type EligibleInternRow = {
  id: string;
  internName: string;
  manager: string;
  location: string;
  currentStage: string;
  graduationDate: string;
  inclinedStatus: string;
};

const ELIGIBLE_INTERN_PLACEHOLDER_ITEMS: EligibleInternRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `eligible-${i}`,
  internName: '--',
  manager: '--',
  location: '--',
  currentStage: '--',
  graduationDate: '--',
  inclinedStatus: '--',
}));

const ELIGIBLE_INTERN_COLUMNS: TableProps.ColumnDefinition<EligibleInternRow>[] = [
  { id: 'internName', header: 'Intern Name', cell: (item) => item.internName, isRowHeader: true },
  { id: 'manager', header: 'Manager', cell: (item) => item.manager },
  { id: 'location', header: 'Location', cell: (item) => item.location },
  { id: 'currentStage', header: 'Current Stage', cell: (item) => item.currentStage },
  { id: 'graduationDate', header: 'Graduation Date', cell: (item) => item.graduationDate },
  { id: 'inclinedStatus', header: 'Inclined Status', cell: (item) => item.inclinedStatus },
];

const metricCardBorder = {
  root: {
    borderColor: '#c6c6cd',
    borderWidth: '1px',
    borderRadius: '8px',
  },
} as const;

const riskCriticalCardStyle = {
  root: {
    background: 'rgba(217, 21, 21, 0.05)',
    borderColor: '#d91515',
    borderWidth: '2px',
    borderRadius: '8px',
  },
} as const;

const riskWarningCardStyle = {
  root: {
    background: 'rgba(245, 150, 0, 0.05)',
    borderColor: '#f59600',
    borderWidth: '2px',
    borderRadius: '8px',
  },
} as const;

const iconBadgeCritical = {
  root: {
    background: '#d91515',
    borderRadius: '9999px',
    borderWidth: '0',
    width: '32px',
    height: '32px',
  },
  content: { paddingBlock: '6px', paddingInline: '6px' },
} as const;

const iconBadgeWarning = {
  root: {
    background: '#f59600',
    borderRadius: '9999px',
    borderWidth: '0',
    width: '32px',
    height: '32px',
  },
  content: { paddingBlock: '6px', paddingInline: '6px' },
} as const;

export default function PerformanceReviews() {
  return (
    <SpaceBetween size="l" direction="vertical">
      <Container
        header={
          <Header
            variant="h2"
            description="May 2026 cycle planning and status"
            actions={<Button variant="primary">Filter</Button>}
          >
            Performance Review Metrics
          </Header>
        }
      >
        <ColumnLayout columns={4}>
          <Container variant="stacked" style={metricCardBorder}>
            <SpaceBetween size="s" direction="vertical">
              <Box fontSize="body-s" color="text-body-secondary">
                Interns at each stage
              </Box>
              <Box fontSize="display-l" fontWeight="heavy">
                --
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Meets all criteria
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" style={metricCardBorder}>
            <SpaceBetween size="s" direction="vertical">
              <Box fontSize="body-s" color="text-body-secondary">
                Avg. Time Each Stage
              </Box>
              <SpaceBetween size="xs" direction="horizontal" alignItems="end">
                <Box fontSize="display-l" fontWeight="heavy">
                  --
                </Box>
                <Box fontSize="body-m" color="text-status-success">
                  + --
                </Box>
              </SpaceBetween>
              <Box fontSize="body-s" color="text-body-secondary">
                --
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" style={metricCardBorder}>
            <SpaceBetween size="s" direction="vertical">
              <Box fontSize="body-s" color="text-body-secondary">
                Stage Dwell Time
              </Box>
              <Box fontSize="display-l" fontWeight="heavy">
                --
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                --
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" style={metricCardBorder}>
            <SpaceBetween size="s" direction="vertical">
              <Box fontSize="body-s" color="text-body-secondary">
                Promo Rate
              </Box>
              <Box fontSize="display-l" fontWeight="heavy">
                --
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Requires action
              </Box>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      </Container>

      <Container
        header={
          <Header
            variant="h2"
            actions={
              <SpaceBetween size="m" direction="horizontal" alignItems="center">
                <SpaceBetween size="xxs" direction="horizontal" alignItems="center">
                  <Box variant="span" fontSize="body-s" color="text-status-error" aria-hidden="true">
                    ●
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    Critical
                  </Box>
                </SpaceBetween>
                <SpaceBetween size="xxs" direction="horizontal" alignItems="center">
                  <Box variant="span" fontSize="body-s" color="text-status-warning" aria-hidden="true">
                    ●
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    Warning
                  </Box>
                </SpaceBetween>
              </SpaceBetween>
            }
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="status-negative" size="medium" ariaLabel="Risk detection" />
              Risk Detection
            </span>
          </Header>
        }
      >
        <ColumnLayout columns={4}>
          <Container variant="stacked" fitHeight style={riskCriticalCardStyle}>
            <SpaceBetween size="m" direction="vertical">
              <Container variant="stacked" style={iconBadgeCritical}>
                <Box textAlign="center">
                  <Icon name="status-in-progress" variant="inverted" size="small" ariaLabel="Dwell time alert" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-error">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                Interns exceeding dwell time
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Interns who remain in the dwell time period {'>'}90 days
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" fitHeight style={riskCriticalCardStyle}>
            <SpaceBetween size="m" direction="vertical">
              <Container variant="stacked" style={iconBadgeCritical}>
                <Box textAlign="center">
                  <Icon name="status-negative" variant="inverted" size="small" ariaLabel="Mentor assignment" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-error">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                Interns without assigned mentor
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" fitHeight style={riskWarningCardStyle}>
            <SpaceBetween size="m" direction="vertical">
              <Container variant="stacked" style={iconBadgeWarning}>
                <Box textAlign="center">
                  <Icon name="user-profile" variant="inverted" size="small" ariaLabel="Warning" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-warning">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                --
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                --
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" fitHeight style={riskWarningCardStyle}>
            <SpaceBetween size="m" direction="vertical">
              <Container variant="stacked" style={iconBadgeWarning}>
                <Box textAlign="center">
                  <Icon name="file" variant="inverted" size="small" ariaLabel="Warning" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-warning">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                --
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                --
              </Box>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      </Container>

      <Container
        header={
          <Header
            variant="h2"
            description="Filters: Start date ≤ Jan 1, 2026 • Stage 2+ • ≥ 6 months until graduation"
            actions={
              <Button variant="primary" iconName="play">
                Generate Eligible List
              </Button>
            }
          >
            Eligible Interns
          </Header>
        }
      >
        <Table
          variant="embedded"
          trackBy="id"
          columnDefinitions={ELIGIBLE_INTERN_COLUMNS}
          items={ELIGIBLE_INTERN_PLACEHOLDER_ITEMS}
          footer={
            <SpaceBetween size="m" direction="horizontal" alignItems="center">
              <Box fontSize="body-s" color="text-body-secondary">
                Showing -- of -- interns • Click any row to view full details
              </Box>
              <Pagination
                disabled
                currentPageIndex={1}
                pagesCount={5}
                ariaLabels={{
                  paginationLabel: 'Eligible interns table pagination',
                  previousPageLabel: 'Previous page',
                  nextPageLabel: 'Next page',
                }}
              />
            </SpaceBetween>
          }
        />
      </Container>

      <Container
        header={
          <Header
            variant="h2"
            description="Filters: Start date ≤ Jan 1, 2026 • Stage 2+ • ≥ 6 months until graduation"
            actions={
              <Button variant="primary" iconName="download">
                Export Calendar
              </Button>
            }
          >
            PR Calendar
          </Header>
        }
      >
        <Container variant="stacked" style={metricCardBorder}>
          <Box padding="xxl" />
        </Container>
      </Container>
    </SpaceBetween>
  );
}
