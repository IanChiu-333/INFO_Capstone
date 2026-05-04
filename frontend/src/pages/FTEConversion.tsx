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
import Select from '@cloudscape-design/components/select';
import BarChart from '@cloudscape-design/components/bar-chart';
import TextFilter from '@cloudscape-design/components/text-filter';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';

const metricCardBorder = {
  root: {
    borderColor: '#c6c6cd',
    borderWidth: '1px',
    borderRadius: '8px',
  },
} as const;

const FTE_GRADUATION_FORECAST_SERIES = [
  {
    type: 'bar' as const,
    title: 'Graduating',
    data: [
      { x: 'May 2026', y: 0 },
      { x: 'June 2026', y: 0 },
      { x: 'Dec 2026', y: 0 },
    ],
    valueFormatter: () => '--',
  },
];

type ConversionPipelineRow = {
  id: string;
  internName: string;
  stage: string;
  gradDate: string;
};

const CONVERSION_PIPELINE_PLACEHOLDER_ITEMS: ConversionPipelineRow[] = Array.from({ length: 5 }, (_, i) => ({
  id: `pipeline-${i}`,
  internName: '--',
  stage: '--',
  gradDate: '--',
}));

const pipelineStatusCell = () => (
  <StatusIndicator type="pending" wrapText={false}>
    --
  </StatusIndicator>
);

const CONVERSION_PIPELINE_COLUMNS: TableProps.ColumnDefinition<ConversionPipelineRow>[] = [
  { id: 'internName', header: 'Intern Name', cell: (item) => item.internName, isRowHeader: true },
  { id: 'stage', header: 'Stage', cell: (item) => item.stage },
  { id: 'gradDate', header: 'Grad Date', cell: (item) => item.gradDate },
  { id: 'inclined', header: 'Inclined', cell: pipelineStatusCell },
  { id: 'extended', header: 'Extended', cell: pipelineStatusCell },
  { id: 'accepted', header: 'Accepted', cell: pipelineStatusCell },
];

export default function FTEConversion() {
  const [filteringText, setFilteringText] = useState('');
  const [selectedItems, setSelectedItems] = useState<ConversionPipelineRow[]>([]);

  return (
    <SpaceBetween size="l" direction="vertical">
      <ColumnLayout columns={4} minColumnWidth={180}>
        <Container variant="stacked" fitHeight style={metricCardBorder}>
          <SpaceBetween size="s" direction="vertical">
            <SpaceBetween size="xs" direction="horizontal" alignItems="center">
              <Box fontSize="body-s" color="text-body-secondary">
                Graduating
              </Box>
              <Select
                selectedOption={{ label: 'All', value: 'all' }}
                options={[{ label: 'All', value: 'all' }]}
                onChange={() => {}}
                ariaLabel="Graduating cohort filter"
              />
            </SpaceBetween>
            <Box fontSize="display-l" fontWeight="heavy">
              --
            </Box>
            <Box fontSize="body-s" color="text-body-secondary">
              Number of interns this season
            </Box>
          </SpaceBetween>
        </Container>
        <Container variant="stacked" fitHeight style={metricCardBorder}>
          <SpaceBetween size="s" direction="vertical">
            <SpaceBetween size="xs" direction="horizontal" alignItems="center">
              <Box fontSize="body-s" color="text-body-secondary">
                Number Inclined
              </Box>
              <Button variant="icon" iconName="status-info" ariaLabel="Number inclined details" />
            </SpaceBetween>
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
            <SpaceBetween size="xs" direction="horizontal" alignItems="center">
              <Box fontSize="body-s" color="text-body-secondary">
                Number not Inclined
              </Box>
              <Button variant="icon" iconName="status-info" ariaLabel="Number not inclined details" />
            </SpaceBetween>
            <Box fontSize="display-l" fontWeight="heavy">
              --
            </Box>
            <Box fontSize="body-s" color="text-body-secondary">
              Number of Interns
            </Box>
          </SpaceBetween>
        </Container>
        <Container variant="stacked" fitHeight style={metricCardBorder}>
          <SpaceBetween size="s" direction="vertical">
            <SpaceBetween size="xs" direction="horizontal" alignItems="center">
              <Box fontSize="body-s" color="text-body-secondary">
                Offer Acceptance
              </Box>
              <Button variant="icon" iconName="status-info" ariaLabel="Offer acceptance details" />
            </SpaceBetween>
            <Box fontSize="display-l" fontWeight="heavy">
              --
            </Box>
            <Box fontSize="body-s" color="text-body-secondary">
              --
            </Box>
          </SpaceBetween>
        </Container>
      </ColumnLayout>

      <Container
        header={
          <Header variant="h2" description="Number of interns graduating by season">
            Graduation Forecast
          </Header>
        }
        footer={
          <SpaceBetween size="m" direction="horizontal" alignItems="center">
            <Box fontSize="body-s" color="text-body-secondary">
              Total Upcoming Conversions
            </Box>
            <Box fontSize="heading-m" fontWeight="heavy">
              --
            </Box>
          </SpaceBetween>
        }
      >
        <BarChart
          series={FTE_GRADUATION_FORECAST_SERIES}
          xDomain={['May 2026', 'June 2026', 'Dec 2026']}
          xScaleType="categorical"
          yDomain={[0, 60]}
          height={240}
          hideLegend
          hideFilter
          ariaLabel="Graduation forecast by season"
          i18nStrings={{
            chartAriaRoleDescription: 'Bar chart',
            xAxisAriaRoleDescription: 'X axis',
            yAxisAriaRoleDescription: 'Y axis',
          }}
        />
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
            actions={
              <SpaceBetween size="s" direction="horizontal" alignItems="center">
                <Box fontSize="body-s" color="text-body-secondary">
                  -- total
                </Box>
                <Button variant="normal" iconName="download">
                  Export table
                </Button>
              </SpaceBetween>
            }
          >
            Conversion Pipeline
          </Header>
        }
      >
        <Table
          variant="embedded"
          trackBy="id"
          columnDefinitions={CONVERSION_PIPELINE_COLUMNS}
          items={CONVERSION_PIPELINE_PLACEHOLDER_ITEMS}
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
                filteringAriaLabel="Filter conversion pipeline"
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
                paginationLabel: 'Conversion pipeline table pagination',
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
