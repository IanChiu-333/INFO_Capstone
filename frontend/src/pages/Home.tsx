import { useState } from "react";
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import styles from './Home.module.css';

const NAV_ITEMS = [
  { id: "program-overview", title: "Program Overview", sub: "Dashboard & metrics" },
  { id: "performance-reviews", title: "Performance Reviews", sub: "Review planning & scheduling" },
  { id: "fte-conversion", title: "FTE Conversion", sub: "Graduation & hiring tracking" },
];

export default function Home() {
  const [active, setActive] = useState("program-overview");

  return (
    <ContentLayout header={<Header variant="h1">Home</Header>}>
      <Container>
        <p>Welcome to the app.</p>
      </Container>
      <br />
      <div className={styles.navGrid}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`${styles.navBtn} ${active === item.id ? styles.navBtnActive : ""}`}
          >
            <div className={styles.btnTitle}>{item.title}</div>
            <div className={styles.btnSub}>{item.sub}</div>
          </button>
        ))}
      </div>
      <br />
      <Container header={<Header variant="h2">Program Health Metrics</Header>}>
        <p>Overall program status as of (add date function here)</p> 
      </Container>
    </ContentLayout>
  );
}