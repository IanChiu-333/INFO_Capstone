import type { ActionItem } from '../../services';
import styles from './ActionItemsGrid.module.css';

interface Props {
  items: ActionItem[];
}

export default function ActionItemsGrid({ items }: Props) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`${styles.card} ${item.severity === 'critical' ? styles.critical : styles.warning}`}
        >
          <div className={`${styles.count} ${item.severity === 'critical' ? styles.countCritical : styles.countWarning}`}>
            {item.count}
          </div>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.desc}>{item.description}</div>
        </div>
      ))}
    </div>
  );
}
