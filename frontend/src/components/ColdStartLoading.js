import styles from '../styles/ColdStartLoading.module.css';

export default function ColdStartLoading({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <h3 className={styles.title}>Waking up the server...</h3>
        <p className={styles.message}>
          This will only take a moment. The app is starting up for the first time today.
        </p>
      </div>
    </div>
  );
} 