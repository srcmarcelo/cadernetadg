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
        <meta name='description' content='Controle seu dinheiro!' />
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
              width={30}
              height={30}
            />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
