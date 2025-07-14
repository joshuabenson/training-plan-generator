import { useState, useEffect } from 'react';
import styles from '../styles/ColdStartLoading.module.css';

export default function ColdStartLoading({ isVisible }) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        {showMessage && (
          <>
            <h3 className={styles.title}>Waking up the server...</h3>
            <p className={styles.message}>
              This will only take a moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
} 