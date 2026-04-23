import { useState } from "react";
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import Select from '@cloudscape-design/components/select';
import type { SelectProps } from '@cloudscape-design/components/select';
import styles from './Home.module.css';

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
        <Container header={<Header variant="h2">Performance Review Metrics</Header>}>
          <p>Performance review metrics placeholder.</p>
        </Container>
      )}
      {activeTabId === "fte-conversion" && (
        <Container header={<Header variant="h2">FTE Conversion Metrics</Header>}>
          <p>FTE conversion metrics placeholder.</p>
        </Container>
      )}
    </ContentLayout>
  );
}