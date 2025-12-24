import styles from './Hero.module.css';
import { useConnect } from '@stacks/connect-react';
import { userSession } from '@/config';
import { useEffect, useState } from 'react';

interface HeroProps {
  onSignClick: () => void;
}

export default function Hero({ onSignClick }: HeroProps) {
  const { authenticate } = useConnect();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    if (userSession && userSession.isUserSignedIn()) {
      setIsSignedIn(true);
      const userData = userSession.loadUserData();
      // Try to get testnet address first for dev, fall back to mainnet
      const address = userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet || '';
      setUserAddress(address);
    }
  }, []);

  const handleConnect = () => {
    authenticate({
      appDetails: {
        name: 'SignWall',
        icon: window.location.origin + '/next.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }

  const handleDisconnect = () => {
    userSession.signUserOut();
    window.location.reload();
  }

  // Prevent hydration mismatch
  if (!isMounted) return null; 

  const truncatedAddress = userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : '';

  return (
    <section className={styles.heroSection}>
      {isSignedIn && userAddress && (
        <div className={styles.walletBadge}>
          <span className={styles.statusDot}></span>
          <span className={styles.addressText}>{truncatedAddress}</span>
          <button className={styles.disconnectButton} onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}

      <div className={styles.titleWrapper}>
        <h1 className={styles.glitchTitle} data-text="SIGNWALL">
          SIGNWALL
        </h1>
      </div>
      <p className={styles.subtitle}>
        Leave your mark on the blockchain forever. Join the decentralized guestbook of the future.
      </p>
      
      <div className={styles.ctaButton}>
         {!isSignedIn ? (
           <button className="btn-primary" onClick={handleConnect}>
              Connect Stacks
           </button>
         ) : (
           <button className="btn-primary" onClick={onSignClick}>
              Sign Wall
           </button>
         )}
      </div>
    </section>
  );
}
