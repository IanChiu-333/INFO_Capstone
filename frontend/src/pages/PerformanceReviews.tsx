import { useState } from 'react';
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
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';

type EligibleInternRow = {
  id: string;
  internName: string;
  manager: string;
};

const ELIGIBLE_INTERN_PLACEHOLDER_ITEMS: EligibleInternRow[] = Array.from({ length: 5 }, (_, i) => ({
  id: `eligible-${i}`,
  internName: '--',
  manager: '--',
}));

const reviewStatusCell = () => (
  <StatusIndicator type="pending" wrapText={false}>
    --
  </StatusIndicator>
);

const ELIGIBLE_INTERN_COLUMNS: TableProps.ColumnDefinition<EligibleInternRow>[] = [
  { id: 'internName', header: 'Intern Name', cell: (item) => item.internName, isRowHeader: true },
  { id: 'manager', header: 'Manager', cell: (item) => item.manager },
  { id: 'reviewStatus', header: 'Performance Review Status', cell: reviewStatusCell },
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
  const [filteringText, setFilteringText] = useState('');
  const [selectedItems, setSelectedItems] = useState<EligibleInternRow[]>([]);

  return (
    <SpaceBetween size="l" direction="vertical">
      <ColumnLayout columns={4} minColumnWidth={180}>
        <Container variant="stacked" fitHeight style={metricCardBorder}>
          <SpaceBetween size="s" direction="vertical">
            <Box fontSize="body-s" color="text-body-secondary">
              Interns Each Stage
            </Box>
            <Box fontSize="display-l" fontWeight="heavy">
              --
            </Box>
            <Box fontSize="body-s" color="text-body-secondary">
              Meets all criteria
            </Box>
          </SpaceBetween>
        </Container>
        <Container variant="stacked" fitHeight style={metricCardBorder}>
          <SpaceBetween size="s" direction="vertical">
            <Box fontSize="body-s" color="text-body-secondary">
              Avg. Time Each Stage
            </Box>
            <Box fontSize="display-l" fontWeight="heavy">
              --
            </Box>
            <Box fontSize="body-s" color="text-body-secondary">
              --
            </Box>
          </SpaceBetween>
        </Container>
        <Container variant="stacked" fitHeight style={metricCardBorder}>
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
        <Container variant="stacked" fitHeight style={metricCardBorder}>
          <SpaceBetween size="s" direction="vertical">
            <Box fontSize="body-s" color="text-body-secondary">
              Promotions
            </Box>
            <Box fontSize="display-l" fontWeight="heavy">
              --
            </Box>
            <Box fontSize="body-s" color="text-body-secondary">
              Interns requiring action
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      <Container
        header={
          <Header
            variant="h2"
            description="Tasks sorted by urgency"
            actions={
              <Button variant="primary" iconName="download">
                Export report
              </Button>
            }
          >
            Risk Detection
          </Header>
        }
      >
        <ColumnLayout columns={4} minColumnWidth={180}>
          <Container variant="stacked" fitHeight style={riskCriticalCardStyle}>
            <SpaceBetween size="m" direction="vertical">
              <Container variant="stacked" style={iconBadgeCritical}>
                <Box textAlign="center">
                  <Icon name="status-in-progress" variant="inverted" size="small" ariaLabel="Exceeding dwell time" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-error">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                Exceeding Dwell time
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Dwell time period {'>'}90 days
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" fitHeight style={riskCriticalCardStyle}>
            <SpaceBetween size="m" direction="vertical">
              <Container variant="stacked" style={iconBadgeCritical}>
                <Box textAlign="center">
                  <Icon name="status-negative" variant="inverted" size="small" ariaLabel="Without assigned mentor" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-error">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                Without Assigned Mentor
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Requiring assignment
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" fitHeight style={riskWarningCardStyle}>
            <SpaceBetween size="m" direction="vertical">
              <Container variant="stacked" style={iconBadgeWarning}>
                <Box textAlign="center">
                  <Icon name="status-in-progress" variant="inverted" size="small" ariaLabel="Stage dwell time" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-warning">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                Stage Dwell Time
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
                  <Icon name="file" variant="inverted" size="small" ariaLabel="Promotions" />
                </Box>
              </Container>
              <Box fontSize="heading-l" fontWeight="heavy" color="text-status-warning">
                --
              </Box>
              <Box fontSize="body-m" fontWeight="bold">
                Promotions
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Interns requiring action
              </Box>
            </SpaceBetween>
          </Container>
        </ColumnLayout>
      </Container>

      <Container
        header={
          <Header
            variant="h2"
            counter="(--)"
            info={
              <Link href="#" variant="info" onFollow={(e) => e.preventDefault()}>
                Info
              </Link>
            }
            description="Track hiring meetings, offers, and acceptances"
            actions={
              <SpaceBetween size="s" direction="horizontal" alignItems="center">
                <Box fontSize="body-s" color="text-body-secondary">
                  -- total
                </Box>
                <Button variant="normal" iconName="add-plus">
                  Add intern
                </Button>
                <Button variant="primary" iconName="download">
                  Export table
                </Button>
              </SpaceBetween>
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
          selectionType="multi"
          selectedItems={selectedItems}
          onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
          sortingDisabled
          filter={
            <SpaceBetween size="m" direction="horizontal" alignItems="center">
              <TextFilter
                filteringText={filteringText}
                onChange={({ detail }) => setFilteringText(detail.filteringText)}
                filteringPlaceholder="Enter value"
                filteringAriaLabel="Filter eligible interns"
              />
              <Box fontSize="body-s" color="text-body-secondary">
                -- Matches
              </Box>
            </SpaceBetween>
          }
          pagination={
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
          }
          footer={
            <Box fontSize="body-s" color="text-body-secondary">
              Showing -- of -- interns • Click any row to view full details
            </Box>
          }
        />
      </Container>
    </SpaceBetween>
  );
}
