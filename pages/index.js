import React from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Main from '../containers/Main';
import Image from 'next/image';
import Auth from '../containers/Auth';

const Home = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  return (
    <div className={styles.container}>
      <Head>
        <title>Caderneta Digital</title>
        <meta name="google-site-verification" content="7fJr2bqqdt9bMxzgx26aMJ7LUGpLLc0FG-0b4tpin_Y" />
        <meta name='description' content='Controle seu dinheiro!' />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        {!session ? (
          <Auth />
        ) : (
          <Main />
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href='https://www.linkedin.com/in/srcmarcelo/'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.linkedin}
        >
          srcmarcelo{' '}
          <span className={styles.logo}>
            <Image
              src='/linkedin.png'
              alt='LinkedIn'
              width={20}
              height={20}
            />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
