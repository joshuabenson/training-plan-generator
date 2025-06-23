import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../styles/Logo.module.css';

export default function Logo() {
  const router = useRouter();

  const [isShimmering, setIsShimmering] = useState(true);
  
  useEffect(() => {
    // Clear initial shimmer after animation
    const timer = setTimeout(() => setIsShimmering(false), 1500);
    return () => clearTimeout(timer);
  }, []); // Only run on mount

  useEffect(() => {
    const handleRouteChange = () => {
        setIsShimmering(true);
        setTimeout(() => setIsShimmering(false), 2500);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
        router.events.off('routeChangeComplete', handleRouteChange);
      };
  }, [router]);

  return (
    <>
        <Link 
          href="/" 
          className={`${styles.logo} ${isShimmering ? styles.logoShimmer : ''}`}
        >
          Rerunnr <span className={styles.preview}>preview</span>
        </Link>
    </>
  );
} 