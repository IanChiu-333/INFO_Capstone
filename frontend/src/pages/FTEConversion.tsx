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
import Icon from '@cloudscape-design/components/icon';
import BarChart from '@cloudscape-design/components/bar-chart';

const metricCardBorder = {
  root: {
    borderColor: '#c6c6cd',
    borderWidth: '1px',
    borderRadius: '8px',
  },
} as const;

const fteFilterToolbarStyle = {
  root: {
    background: '#f9f9fa',
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
  graduationDate: string;
  hiringMeeting: string;
  stage: string;
  inclined: string;
  offerExtended: string;
  offerAccepted: string;
  hcSource: string;
  flags: string;
};

const CONVERSION_PIPELINE_PLACEHOLDER_ITEMS: ConversionPipelineRow[] = Array.from({ length: 5 }, (_, i) => ({
  id: `pipeline-${i}`,
  internName: '--',
  graduationDate: '--',
  hiringMeeting: '--',
  stage: '--',
  inclined: '--',
  offerExtended: '--',
  offerAccepted: '--',
  hcSource: '--',
  flags: '--',
}));

const CONVERSION_PIPELINE_COLUMNS: TableProps.ColumnDefinition<ConversionPipelineRow>[] = [
  { id: 'internName', header: 'Intern Name', cell: (item) => item.internName, isRowHeader: true },
  { id: 'graduationDate', header: 'Graduation Date', cell: (item) => item.graduationDate },
  { id: 'hiringMeeting', header: 'Hiring Meeting', cell: (item) => item.hiringMeeting },
  { id: 'stage', header: 'Stage', cell: (item) => item.stage },
  { id: 'inclined', header: 'Inclined', cell: (item) => item.inclined },
  { id: 'offerExtended', header: 'Offer Extended', cell: (item) => item.offerExtended },
  { id: 'offerAccepted', header: 'Offer Accepted', cell: (item) => item.offerAccepted },
  { id: 'hcSource', header: 'HC Source', cell: (item) => item.hcSource },
  { id: 'flags', header: 'Flags', cell: (item) => item.flags },
];

export default function FTEConversion() {
  return (
    <SpaceBetween size="l" direction="vertical">
      <Container
        header={
          <Header
            variant="h2"
            description="Graduation and hiring pipeline status"
            actions={<Button variant="primary">Filter</Button>}
          >
            FTE Conversion Metrics
          </Header>
        }
      >
        <ColumnLayout columns={4}>
          <Container variant="stacked" style={metricCardBorder}>
            <SpaceBetween size="s" direction="vertical">
              <Box fontSize="body-s" color="text-body-secondary">
                Number of Interns Graduating
              </Box>
              <Box fontSize="display-l" fontWeight="heavy">
                --
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Graduating in {'<'}90 days
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" style={metricCardBorder}>
            <SpaceBetween size="s" direction="vertical">
              <Box fontSize="body-s" color="text-body-secondary">
                Number Inclined
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
                Number Not Inclined
              </Box>
              <SpaceBetween size="xs" direction="horizontal" alignItems="end">
                <Box fontSize="display-l" fontWeight="heavy">
                  --
                </Box>
                <Box fontSize="body-m" color="text-status-success">
                  - --
                </Box>
              </SpaceBetween>
              <Box fontSize="body-s" color="text-body-secondary">
                Meeting → Extension
              </Box>
            </SpaceBetween>
          </Container>
          <Container variant="stacked" style={metricCardBorder}>
            <SpaceBetween size="s" direction="vertical">
              <Box fontSize="body-s" color="text-body-secondary">
                Offer Acceptance
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
        </ColumnLayout>
      </Container>

      <Container
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
        <SpaceBetween size="m" direction="vertical">
          <Header variant="h3" description="Number of interns graduating by season">
            Graduation Forecast
          </Header>
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
        </SpaceBetween>
      </Container>

      <Container
        header={
          <Header variant="h2" description="Track hiring meetings, offers, and acceptances">
            Conversion Pipeline
          </Header>
        }
      >
        <SpaceBetween size="l" direction="vertical">
          <Container variant="stacked" style={fteFilterToolbarStyle}>
            <SpaceBetween size="s" direction="horizontal" alignItems="center">
              <Icon name="filter" size="small" ariaLabel="Filters" />
              <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">
                FILTERS:
              </Box>
              <Select
                disabled
                selectedOption={{ label: 'Season', value: 'season' }}
                options={[{ label: 'Season', value: 'season' }]}
                onChange={() => {}}
                ariaLabel="Season filter"
              />
              <Select
                disabled
                selectedOption={{ label: 'Stage', value: 'stage' }}
                options={[{ label: 'Stage', value: 'stage' }]}
                onChange={() => {}}
                ariaLabel="Stage filter"
              />
              <Select
                disabled
                selectedOption={{ label: 'Inclined', value: 'inclined' }}
                options={[{ label: 'Inclined', value: 'inclined' }]}
                onChange={() => {}}
                ariaLabel="Inclined filter"
              />
              <Select
                disabled
                selectedOption={{ label: 'Manager', value: 'manager' }}
                options={[{ label: 'Manager', value: 'manager' }]}
                onChange={() => {}}
                ariaLabel="Manager filter"
              />
              <Select
                disabled
                selectedOption={{ label: 'Location', value: 'location' }}
                options={[{ label: 'Location', value: 'location' }]}
                onChange={() => {}}
                ariaLabel="Location filter"
              />
            </SpaceBetween>
          </Container>
          <Table
            variant="embedded"
            trackBy="id"
            columnDefinitions={CONVERSION_PIPELINE_COLUMNS}
            items={CONVERSION_PIPELINE_PLACEHOLDER_ITEMS}
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
                    paginationLabel: 'Conversion pipeline table pagination',
                    previousPageLabel: 'Previous page',
                    nextPageLabel: 'Next page',
                  }}
                />
              </SpaceBetween>
            }
          />
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}
