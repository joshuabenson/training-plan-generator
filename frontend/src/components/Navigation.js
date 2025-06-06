import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  const currentPath = router.pathname;
  const [isShimmering, setIsShimmering] = useState(true); // Start with true for initial load
  const { user, signInWithGoogle, logout, loading } = useAuth();

  useEffect(() => {
    // Clear initial shimmer after animation
    const timer = setTimeout(() => setIsShimmering(false), 1500);
    return () => clearTimeout(timer);
  }, []); // Only run on mount

  // Handle route changes
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

  const handleAuthAction = () => {
    if (user) {
      logout();
    } else {
      signInWithGoogle();
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link 
          href="/" 
          className={`${styles.logo} ${isShimmering ? styles.logoShimmer : ''}`}
        >
          Rerunnr
        </Link>
        <div className={styles.navContent}>
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
          <div className={styles.authSection}>
            {!loading && (
              <>
                {user && (
                  <div className={styles.userInfo}>
                    <img 
                      src={user.photoURL || '/default-avatar.png'} 
                      alt="Profile" 
                      className={styles.avatar}
                    />
                    <span className={styles.userName}>{user.displayName}</span>
                  </div>
                )}
                <button 
                  onClick={handleAuthAction}
                  className={styles.authButton}
                  disabled={loading}
                >
                  {user ? 'Sign Out' : 'Sign In'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 