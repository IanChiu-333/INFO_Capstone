import { useState } from 'react';
import type { ProgramMetrics } from '../../services';
import styles from './MetricsGrid.module.css';

interface Props {
  metrics: ProgramMetrics;
  locationCounts: Record<string, number>;
}

function Delta({ value }: { value: number | null }) {
  if (value === null || value === 0) return null;
  const color = value > 0 ? styles.deltaPos : styles.deltaNeg;
  const label = value > 0 ? `+${value}` : `${value}`;
  return <span className={`${styles.delta} ${color}`}>{label}</span>;
}

function DeltaPct({ value }: { value: number | null }) {
  if (value === null) return null;
  const color = value > 0 ? styles.deltaPos : styles.deltaNeg;
  const label = value > 0 ? `+${value}%` : `${value}%`;
  return <span className={`${styles.delta} ${color}`}>{label}</span>;
}

export default function MetricsGrid({ metrics, locationCounts }: Props) {
  const locations = Object.keys(locationCounts).sort();
  const [selectedLocation, setSelectedLocation] = useState(locations[0] ?? '');

  const seasons = ['Season'];
  const [selectedSeason] = useState('Season');

  const locationCount = locationCounts[selectedLocation] ?? 0;

  return (
    <div className={styles.gridWrapper}>
      {/* Row 1 */}
      <div className={styles.row}>
        {/* Total Active Interns */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Total Active Interns</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{metrics.totalActiveInterns}</span>
            <Delta value={metrics.totalActiveDelta} />
          </div>
          <span className={styles.sub}>All Stages Combined</span>
        </div>

        {/* Location (dropdown) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Location</span>
            <select
              className={styles.dropdown}
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              aria-label="Select location"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{locationCount}</span>
            <Delta value={metrics.totalActiveDelta} />
          </div>
          <span className={styles.sub}>Number of JDE Interns</span>
        </div>

        {/* Joining This Month */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Joining This Month</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{metrics.joiningThisMonth}</span>
            <DeltaPct value={metrics.joiningDeltaPct} />
          </div>
          <span className={styles.sub}>Last 6 Months Average</span>
        </div>

        {/* Leaving Per Month */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Leaving Per Month</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{metrics.leavingPerMonth}</span>
            <DeltaPct value={metrics.leavingDeltaPct} />
          </div>
          <span className={styles.sub}>Last 6 Months Average</span>
        </div>
      </div>

      {/* Row 2 */}
      <div className={styles.row}>
        {/* Total Program Duration */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Total Program Duration</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{metrics.avgProgramDurationMonths} mo</span>
          </div>
          <span className={styles.sub}>Start to Graduation</span>
        </div>

        {/* Graduating (Season dropdown) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Graduating</span>
            <select
              className={styles.dropdown}
              value={selectedSeason}
              aria-label="Select season"
              onChange={() => {}}
            >
              {seasons.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{metrics.graduatingThisSeason}</span>
            <DeltaPct value={metrics.graduatingDeltaPct} />
          </div>
          <span className={styles.sub}>Number this Season</span>
        </div>

        {/* Overall Conversion Rate */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Overall Conversion Rate</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{metrics.overallConversionRate}%</span>
            <DeltaPct value={metrics.conversionDeltaPct} />
          </div>
          <span className={styles.sub}>Last 6 Months Average</span>
        </div>

        {/* Post-Program Retention */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Post-Program Retention</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>{metrics.postProgramRetentionRate}%</span>
            <DeltaPct value={metrics.retentionDeltaPct} />
          </div>
          <span className={styles.sub}>Last 6 Months Average</span>
        </div>
      </div>
    </div>
  );
}
