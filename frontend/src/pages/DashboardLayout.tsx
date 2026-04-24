import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import styles from './DashboardLayout.module.css';

const NAV_TABS = [
  { label: 'Program Overview',    sub: 'Dashboard & metrics',          path: '/' },
  { label: 'Performance Reviews', sub: 'Review planning & scheduling', path: '/performance-reviews' },
  { label: 'FTE Conversion',      sub: 'Graduation & hiring tracking', path: '/fte-conversion' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

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
    >
      <SpaceBetween size="l">
        <Container>
          <Header
            variant="h1"
            description="Performance reviews and FTE conversion tracking for May 2026 cycle"
            actions={<Button iconName="download">Export Report</Button>}
          >
            Junior Developer Program Dashboard
          </Header>
        </Container>

        <div className={styles.navGrid}>
          {NAV_TABS.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`${styles.navBtn} ${isActive(tab.path) ? styles.navBtnActive : ''}`}
            >
              <div className={styles.btnTitle}>{tab.label}</div>
              <div className={styles.btnSub}>{tab.sub}</div>
            </button>
          ))}
        </div>

        <Outlet />
      </SpaceBetween>
    </ContentLayout>
  );
}
