import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import styles from './DashboardLayout.module.css';

const NAV_TABS = [
  { label: 'Program Overview',    path: '/' },
  { label: 'Performance Reviews', path: '/performance-reviews' },
  { label: 'FTE Conversion',      path: '/fte-conversion' },
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
          <SpaceBetween size="m">
            <Header
              variant="h1"
              description="Performance reviews and FTE conversion tracking for May 2026 cycle"
              actions={<Button variant="primary" iconName="download">Export report</Button>}
            >
              Junior Developer Program Dashboard
            </Header>

            <div className={styles.tabBar}>
              {NAV_TABS.map((tab) => (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`${styles.tab} ${isActive(tab.path) ? styles.tabActive : ''}`}
                >
                  <div className={styles.tabInner}>
                    <span className={styles.tabLabel}>{tab.label}</span>
                  </div>
                  <div className={styles.tabUnderline} />
                </button>
              ))}
            </div>
          </SpaceBetween>
        </Container>

        <Outlet />
      </SpaceBetween>
    </ContentLayout>
  );
}
