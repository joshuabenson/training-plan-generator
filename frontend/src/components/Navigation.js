import Link from 'next/link';
import { useRouter } from 'next/router';
// import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  const router = useRouter();
  const currentPath = router.pathname;
  const { user, signInWithGoogle, logout, loading } = useAuth();

  const handleAuthAction = () => {
    if (user) {
      logout();
    } else {
      router.push('/login');
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Logo />
        
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
    </nav>
  );
} 