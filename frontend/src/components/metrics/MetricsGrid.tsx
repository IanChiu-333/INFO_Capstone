import { useState } from 'react';
import type { ProgramMetrics } from '../../services';
import styles from './MetricsGrid.module.css';

interface Props {
  metrics: ProgramMetrics;
  locationCounts: Record<string, number>;
}

export default function MetricsGrid({ metrics, locationCounts }: Props) {
  const locations = Object.keys(locationCounts).sort();
  const [selectedLocation, setSelectedLocation]     = useState(locations[0] ?? '');
  const [selectedCostCenter, setSelectedCostCenter] = useState(locations[0] ?? '');

  return (
    <div className={styles.grid}>
      {/* Row 1 */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Total Active Interns</span>
        </div>
        <span className={styles.cardValue}>{metrics.totalActiveInterns}</span>
        <span className={styles.cardSub}>All stages combined</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Location</span>
          <select
            className={styles.select}
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            aria-label="Select location"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <span className={styles.cardValue}>{locationCounts[selectedLocation] ?? 0}</span>
        <span className={styles.cardSub}>Number of interns in {selectedLocation}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Joining this Month</span>
        </div>
        <span className={styles.cardValue}>{metrics.joiningThisMonth}</span>
        <span className={styles.cardSub}>Number of interns</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Leaving each month</span>
        </div>
        <span className={styles.cardValue}>{metrics.leavingPerMonth}</span>
        <span className={styles.cardSub}>Last 6 month average</span>
      </div>

      {/* Row 2 */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Program Duration</span>
        </div>
        <span className={styles.cardValue}>{metrics.avgProgramDurationMonths} mo</span>
        <span className={styles.cardSub}>Start to graduation</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Cost Center</span>
          <select
            className={styles.select}
            value={selectedCostCenter}
            onChange={e => setSelectedCostCenter(e.target.value)}
            aria-label="Select cost center"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <span className={styles.cardValue}>{locationCounts[selectedCostCenter] ?? 0}</span>
        <span className={styles.cardSub}>Number of interns per center</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Conversion Rate</span>
        </div>
        <span className={styles.cardValue}>{metrics.overallConversionRate}%</span>
        <span className={styles.cardSub}>Last 6 month average</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardTitle}>Post-program Retention</span>
        </div>
        <span className={styles.cardValue}>{metrics.postProgramRetentionRate}%</span>
        <span className={styles.cardSub}>Last 6 month average</span>
      </div>
    </div>
  );
}
