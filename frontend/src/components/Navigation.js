import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          Rerunr
        </Link>
        <div className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${currentPath === '/' ? styles.active : ''}`}
          >
            Marathon Plan
          </Link>
          <Link 
            href="/return-from-injury" 
            className={`${styles.navLink} ${currentPath === '/return-from-injury' ? styles.active : ''}`}
          >
            Return From Injury
          </Link>
        </div>
      </div>
    </nav>
  );
} 