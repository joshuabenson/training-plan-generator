import React from 'react';
import styles from '../styles/Loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={`${styles.dot} ${styles.dot1}`}></div>
        <div className={`${styles.dot} ${styles.dot2}`}></div>
        <div className={`${styles.dot} ${styles.dot3}`}></div>
        <div className={`${styles.dot} ${styles.dot4}`}></div>
      </div>
      <span className={styles.loadingText}>Generating your plan...</span>
    </div>
  );
} 