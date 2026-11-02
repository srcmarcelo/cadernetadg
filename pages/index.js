import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Button } from 'antd';
import { useSessionContext } from '../services/supabaseClient';
import styles from '../styles/Home.module.css';
import Main from '../containers/Main';
import Auth from '../containers/Auth';
import LoadingScreen from '../componets/LoadingScreen';

const Home = () => {
  const { session, isLoading } = useSessionContext();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPromotionBar, setShowPromotionBar] = useState(false);

  useEffect(() => {
    // Register clean network-first PWA service worker in production
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => reg.update())
        .catch(() => {});
    }

    if (typeof window !== 'undefined' && 'onbeforeinstallprompt' in window) {
      const handleBeforeInstallPrompt = (event) => {
        event.preventDefault();
        setDeferredPrompt(event);
        setTimeout(() => setShowPromotionBar(true), 200);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt
        );
      };
    }
    return undefined;
  }, []);

  const closePromotionBar = () => {
    setDeferredPrompt(null);
    setShowPromotionBar(false);
  };

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => {
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
        <meta name='description' content='Controle seu dinheiro todos os meses!' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, viewport-fit=cover'
        />
        <meta name='theme-color' content='#1E295E' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {showPromotionBar && (
        <div
          style={{
            backgroundColor: '#1E295E',
            color: '#fff',
            padding: '10px 16px',
            position: 'relative',
            width: '100%',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Instale o app Caderneta Digital na tela inicial!
          </span>
          <Button size='small' onClick={handleInstallClick}>
            Instalar
          </Button>
          <Button
            size='small'
            type='text'
            style={{ color: '#CBD5E1' }}
            onClick={closePromotionBar}
          >
            Agora não
          </Button>
        </div>
      )}

      <main className={styles.main}>
        {isLoading ? <LoadingScreen /> : !session ? <Auth /> : <Main />}
      </main>
    </div>
  );
};

export default Home;
