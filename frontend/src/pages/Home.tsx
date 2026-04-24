import { useState } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Pagination from '@cloudscape-design/components/pagination';
import Box from '@cloudscape-design/components/box';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import styles from './Home.module.css';

const NAV_ITEMS = [
  { id: 'program-overview',   title: 'Program Overview',    sub: 'Dashboard & metrics' },
  { id: 'performance-reviews',title: 'Performance Reviews', sub: 'Review planning & scheduling' },
  { id: 'fte-conversion',     title: 'FTE Conversion',      sub: 'Graduation & hiring tracking' },
];

const METRICS = [
  { label: 'Total Active Interns',    value: '148',     delta: '+5',      deltaType: 'positive', sub: 'All stages combined' },
  { label: 'Graduating This Season',  value: '105',     delta: '+12%',    deltaType: 'positive', sub: 'May: 45 | Jun: 32 | Dec: 28' },
  { label: 'Overall Conversion Rate', value: '84%',     delta: '+3%',     deltaType: 'positive', sub: 'Last 6 months average' },
  { label: 'Avg Program Duration',    value: '11.2 mo', delta: '-0.3 mo', deltaType: 'negative', sub: 'Start to graduation' },
];

const ACTION_ITEMS = [
  { count: 8,  title: 'Missing Hiring Meetings', desc: 'Interns graduating in <90 days without hiring meeting scheduled', severity: 'critical' },
  { count: 12, title: 'Inclined Without Offer',  desc: 'Inclined candidates without offer extended >7 days',             severity: 'critical' },
  { count: 15, title: 'Stage Dwell Threshold',   desc: 'Interns exceeding recommended stage dwell time',                 severity: 'warning' },
  { count: 6,  title: 'No HC Source',            desc: 'Graduating <90 days without confirmed headcount source',         severity: 'warning' },
];

const ENROLLMENT_DATA = [
  { month: 'Jan', count: 130 },
  { month: 'Feb', count: 137 },
  { month: 'Mar', count: 140 },
  { month: 'Apr', count: 142 },
  { month: 'May', count: 143 },
  { month: 'Jun', count: 145 },
];

const STAGE_DATA = [
  { stage: 'Stage 1', count: 35 },
  { stage: 'Stage 2', count: 32 },
  { stage: 'Stage 3', count: 30 },
  { stage: 'Stage 4', count: 20 },
];

const INTERNS = [
  { name: 'Sarah Chen',       manager: 'Manager A', location: 'Seattle',       stage: 'Stage 3', graduation: 'Aug 15, 2026', inclined: 'Yes' },
  { name: 'Michael Torres',   manager: 'Manager B', location: 'San Francisco', stage: 'Stage 2', graduation: 'Dec 20, 2026', inclined: 'Yes' },
  { name: 'Emily Johnson',    manager: 'Manager A', location: 'Seattle',       stage: 'Stage 3', graduation: 'Aug 10, 2026', inclined: 'Pending' },
  { name: 'David Kim',        manager: 'Manager C', location: 'Austin',        stage: 'Stage 4', graduation: 'Jun 30, 2026', inclined: 'Yes' },
  { name: 'Jessica Martinez', manager: 'Manager B', location: 'New York',      stage: 'Stage 2', graduation: 'Dec 15, 2026', inclined: 'No' },
  { name: 'Ryan Patel',       manager: 'Manager A', location: 'Seattle',       stage: 'Stage 3', graduation: 'Aug 5, 2026',  inclined: 'Yes' },
  { name: 'Alex Zhang',       manager: 'Manager D', location: 'Boston',        stage: 'Stage 1', graduation: 'Oct 10, 2026', inclined: 'Pending' },
  { name: 'Maria Lopez',      manager: 'Manager E', location: 'Chicago',       stage: 'Stage 2', graduation: 'Sep 15, 2026', inclined: 'Yes' },
];

type Intern = typeof INTERNS[number];

export default function Home() {
  const [active, setActive] = useState('program-overview');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <ContentLayout
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: 'Home', href: '/' },
            { text: 'Program Dashboard', href: '#' },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header
          variant="h1"
          description="Performance reviews and FTE conversion tracking for May 2026 cycle"
          actions={<Button iconName="download">Export Report</Button>}
        >
          Junior Developer Program Dashboard
        </Header>
      }
    >
      <SpaceBetween size="l">

        {/* Section nav */}
        <div className={styles.navGrid}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`${styles.navBtn} ${active === item.id ? styles.navBtnActive : ''}`}
            >
              <div className={styles.btnTitle}>{item.title}</div>
              <div className={styles.btnSub}>{item.sub}</div>
            </button>
          ))}
        </div>

        {/* Program Health Metrics */}
        <Container
          header={
            <Header
              variant="h2"
              description="Overall program status as of March 3, 2026"
              actions={<Button variant="primary" iconName="add-plus">Add New Intern</Button>}
            >
              Program Health Metrics
            </Header>
          }
        >
          <div className={styles.metricsGrid}>
            {METRICS.map((m) => (
              <div key={m.label} className={styles.metricCard}>
                <div className={styles.metricLabel}>{m.label}</div>
                <div className={styles.metricRow}>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className={`${styles.metricDelta} ${m.deltaType === 'positive' ? styles.deltaPos : styles.deltaNeg}`}>
                    {m.delta}
                  </span>
                </div>
                <div className={styles.metricSub}>{m.sub}</div>
              </div>
            ))}
          </div>
        </Container>

        {/* Requires Action */}
        <Container
          header={
            <Header
              variant="h2"
              actions={
                <SpaceBetween direction="horizontal" size="s">
                  <span className={styles.legendCritical}>● Critical</span>
                  <span className={styles.legendWarning}>● Warning</span>
                </SpaceBetween>
              }
            >
              ⚠ Requires Action
            </Header>
          }
        >
          <div className={styles.alertGrid}>
            {ACTION_ITEMS.map((item) => (
              <div
                key={item.title}
                className={`${styles.alertCard} ${item.severity === 'critical' ? styles.alertCritical : styles.alertWarning}`}
              >
                <div className={`${styles.alertCount} ${item.severity === 'critical' ? styles.alertCountCritical : styles.alertCountWarning}`}>
                  {item.count}
                </div>
                <div className={styles.alertTitle}>{item.title}</div>
                <div className={styles.alertDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </Container>

        {/* Charts */}
        <div className={styles.chartsRow}>
          <Container
            header={
              <Header variant="h2" description="Total active interns over time">
                Active Enrollment Trend
              </Header>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ENROLLMENT_DATA} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ebed" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 160]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0972d3" strokeWidth={2} dot={{ r: 4, fill: '#0972d3' }} />
              </LineChart>
            </ResponsiveContainer>
          </Container>

          <Container
            header={
              <Header variant="h2" description="Number of interns per stage">
                Current Stage Distribution
              </Header>
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={STAGE_DATA} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ebed" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 60]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0972d3" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Container>
        </div>

        {/* All Active Interns */}
        <Table
          header={
            <Header
              variant="h2"
              description="Complete roster across all stages and locations"
              counter="(148 Total)"
            >
              All Active Interns
            </Header>
          }
          columnDefinitions={[
            { id: 'name',       header: 'Intern Name',     cell: (i: Intern) => i.name },
            { id: 'manager',    header: 'Manager',         cell: (i: Intern) => i.manager },
            { id: 'location',   header: 'Location',        cell: (i: Intern) => i.location },
            { id: 'stage',      header: 'Current Stage',   cell: (i: Intern) => i.stage },
            { id: 'graduation', header: 'Graduation Date', cell: (i: Intern) => i.graduation },
            { id: 'inclined',   header: 'Inclined Status', cell: (i: Intern) => i.inclined },
          ]}
          items={INTERNS}
          pagination={
            <Pagination
              currentPageIndex={currentPage}
              pagesCount={19}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            />
          }
          footer={
            <Box color="text-body-secondary" fontSize="body-s">
              Showing 8 of 148 Interns • Click any row to view full details
            </Box>
          }
        />

      </SpaceBetween>
    </ContentLayout>
  );
}
