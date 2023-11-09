import React, { useEffect, useState } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Main from '../containers/Main';
import Image from 'next/image';
import Auth from '../containers/Auth';
import LoadingScreen from '../componets/LoadingScreen';

const Home = () => {
  const sessionContext = useSessionContext();
  const { session, isLoading } = sessionContext;

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPromotionBar, setShowPromotionBar] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      // Prevent the default prompt
      event.preventDefault();

      // Store the event for later use
      setDeferredPrompt(event);

      // Show the promotion bar with a delay for the fade-in animation
      setTimeout(() => setShowPromotionBar(true), 100);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup event listener
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const closePromotionBar = () => {
    // Reset the deferredPrompt for future use
    setDeferredPrompt(null);

    // Hide the promotion bar with a delay for the fade-out animation
    setTimeout(() => setShowPromotionBar(false), 100);
  };

  const handleInstallClick = () => {
    // Trigger PWA installation
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA installation');
      } else {
        console.log('User declined the PWA installation');
      }

      closePromotionBar();
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Caderneta Digital</title>
        <meta
          name='google-site-verification'
          content='7fJr2bqqdt9bMxzgx26aMJ7LUGpLLc0FG-0b4tpin_Y'
        />
        <meta name='description' content='Controle seu dinheiro!' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {showPromotionBar && (
        <div
          style={{
            backgroundColor: '#4CAF50',
            color: '#fff',
            textAlign: 'center',
            padding: '10px',
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            zIndex: '1000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeIn 0.5s ease-in-out',
          }}
        >
          <div style={{ display: 'inline-block', marginRight: '20px' }}>
            🚀 Instale o Caderneta Digital!
          </div>
          <button
            onClick={handleInstallClick}
            style={{
              backgroundColor: '#fff',
              color: '#4CAF50',
              border: 'none',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Instalar
          </button>
          <button
            onClick={closePromotionBar}
            style={{
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Não, obrigado.
          </button>
        </div>
      )}

      <main className={styles.main}>
        {isLoading ? <LoadingScreen /> : !session ? <Auth /> : <Main />}
      </main>

      {/* <footer className={styles.footer}>
        <a
          href='https://www.linkedin.com/in/srcmarcelo/'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.linkedin}
        >
          srcmarcelo{' '}
          <span className={styles.logo}>
            <Image src='/linkedin.png' alt='LinkedIn' width={20} height={20} />
          </span>
        </a>
      </footer> */}
    </div>
  );
};

export default Home;
