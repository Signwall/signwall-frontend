import styles from './Wall.module.css';

interface Signature {
  id: number;
  name: string;
  message: string;
  timestamp: string;
}

export default function Wall() {
  const signatures: Signature[] = []; // Empty array - ready for real data

  return (
    <section className={styles.wallSection}>
      <h2 className={styles.wallHeader}>Recent Signatures</h2>
      <div className={`container ${styles.grid}`}>
        {signatures.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No signatures yet. Be the first to sign the wall!</p>
          </div>
        ) : (
          signatures.map((sig) => (
            <div key={sig.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.cardHeader}>
                <span className={styles.name}>{sig.name}</span>
                <span className={styles.timestamp}>{sig.timestamp}</span>
              </div>
              <p className={styles.message}>{sig.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
