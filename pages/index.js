import React from 'react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Main from '../containers/Main';

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
          <div className={styles.authContainer}>
            <h1>Caderneta Digital</h1>
            <p>Controle seu dinheiro!</p>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme='dark'
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Seu email',
                    password_label: 'Sua senha',
                    button_label: 'ENTRAR',
                  },
                  forgotten_password: {
                    link_text: 'Esqueceu a senha?',
                  },
                  sign_up: {
                    link_text: 'Ainda não tem uma conta? Registre-se',
                  },
                },
              }}
            />
          </div>
        ) : (
          <Main />
        )}
      </main>
    </div>
  );
};

export default Home;
