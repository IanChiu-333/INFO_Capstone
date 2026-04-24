import { useState } from "react";
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import Select from '@cloudscape-design/components/select';
import type { SelectProps } from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import type { TableProps } from '@cloudscape-design/components/table';
import Pagination from '@cloudscape-design/components/pagination';
import Icon from '@cloudscape-design/components/icon';
import BarChart from '@cloudscape-design/components/bar-chart';
import styles from './Home.module.css';

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

const LOCATION_OPTIONS: SelectProps.Option[] = [
  { label: "Seattle", value: "seattle" },
  { label: "Bay Area", value: "bay-area" },
  { label: "Remote", value: "remote" },
];

const NAV_ITEMS = [
  { id: "program-overview", title: "Program Overview", sub: "Dashboard & metrics" },
  { id: "performance-reviews", title: "Performance Reviews", sub: "Review planning & scheduling" },
  { id: "fte-conversion", title: "FTE Conversion", sub: "Graduation & hiring tracking" },
];

export default function Home() {
  const [activeTabId, setActiveTabId] = useState("program-overview");
  const [locationOption, setLocationOption] = useState<SelectProps.Option | null>(
    LOCATION_OPTIONS[0] ?? null
  );

  return (
    <ContentLayout header={<Header variant="h1">Home</Header>}>
      <Container header={<Header variant="h2">Junior Developer Program Dashboard</Header>}>
        <p> Performance reviews and FTE conversion tracking for *insert date* cycle </p>
      </Container>
      <br />
      <div className={styles.navGrid}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTabId(item.id)}
            className={`${styles.navBtn} ${activeTabId === item.id ? styles.navBtnActive : ""}`}
          >
            <div className={styles.btnTitle}>{item.title}</div>
            <div className={styles.btnSub}>{item.sub}</div>
          </button>
        ))}
      </div>
      <br />
      {activeTabId === "program-overview" && (
        <Container header={<Header variant="h2">Program Health Metrics</Header>}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricsRow}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Total Active Interns</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSub}>All stages combined</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Location</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSelect}>
                  <Select
                    selectedOption={locationOption}
                    onChange={({ detail }) => setLocationOption(detail.selectedOption)}
                    options={LOCATION_OPTIONS}
                    selectedAriaLabel="Selected location"
                    ariaLabel="Location"
                  />
                </div>
                <div className={styles.metricSub}>Number of JDE Interns</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Joining This Month</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSub}>Last 6 months average</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Leaving Per Month</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSub}>Last 6 months average</div>
              </div>
            </div>
            <div className={styles.metricsRow}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Avg Program Duration</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSub}>Start to graduation</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Graduating This Season</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSub}>May: -- | Jun: -- | Dec: --</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Overall Conversion Rate</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSub}>Last 6 months average</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Post-program Retention</div>
                <div className={styles.metricValueRow}>
                  <span className={styles.metricValue}>--</span>
                  <span className={styles.metricDelta} />
                </div>
                <div className={styles.metricSub}>Last 6 months average</div>
              </div>
            </div>
          </div>
        </Container>
      )}
      {activeTabId === "performance-reviews" && (
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
      )}
      {activeTabId === "fte-conversion" && (
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
      )}
    </ContentLayout>
  );
}