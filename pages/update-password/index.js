import React, { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Image from 'next/image';
import { RegistrationForm } from '../../containers/Auth/styles';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';

const UpdatePassword = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const updatePassword = async (values) => {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (data) message.success('Senha atualizada com sucesso!');
    if (error)
      message.error(
        'Ocorreu um erro ao tentar trocar sua senha. Por favor, tente novamente.'
      );
    setLoading(false);
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Caderneta Digital</title>
        <meta name='description' content='Controle seu dinheiro!' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        {session ? (
          <>
            <h1 style={{ color: '#232c68' }}>Atualização de senha</h1>
            <RegistrationForm layout='vertical' onFinish={updatePassword}>
              <Form.Item
                label={<span style={{ color: 'white' }}>Nova senha</span>}
                style={{ width: '100%' }}
                name='password'
                requiredMark='optional'
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Digite uma senha de no mínimo 6 dígitos.',
                    min: 6,
                  },
                ]}
              >
                <Input.Password style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: 'white' }}>Confirmar senha</span>}
                name='confirmPassword'
                requiredMark='optional'
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Confirme sua senha.',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('As senhas devem ser iguais!')
                      );
                    },
                  }),
                ]}
              >
                <Input.Password style={{ width: '100%' }} />
              </Form.Item>
              <Button type='primary' htmlType='submit' loading={loading}>
                Mudar Senha
              </Button>
            </RegistrationForm>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <h1 style={{ color: '#232c68', textAlign: 'center', width: '70%' }}>
              Você só pode acessar essa página através de um link de recuperação
              no email
            </h1>
            <p style={{ color: '#232c68', textAlign: 'center', width: '70%' }}>
              Caso esteja vindo do email, aguarde que estamos carregando o
              formulário para que possa mudar sua senha.
            </p>
            <Button type='primary' onClick={() => router.push('/')}>
              Ir para o login
            </Button>
          </div>
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
            <Image src='/linkedin.png' alt='LinkedIn' width={20} height={20} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default UpdatePassword;
