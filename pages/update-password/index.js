import React, { useState } from 'react';
import Head from 'next/head';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '../../services/supabaseClient';
import styles from '../../styles/Home.module.css';

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

    if (error) {
      message.error(
        'Ocorreu um erro ao tentar trocar sua senha. Por favor, tente novamente.'
      );
      setLoading(false);
      return;
    }

    if (data) {
      message.success('Senha atualizada com sucesso!');
    }
    setLoading(false);
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Atualizar Senha — Caderneta Digital</title>
        <meta name='description' content='Controle seu dinheiro!' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main
        className={styles.main}
        style={{ justifyContent: 'center', padding: '24px 16px' }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '28px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
          }}
        >
          {session ? (
            <>
              <h2 style={{ color: '#1E295E', marginTop: 0, textAlign: 'center' }}>
                Criar Nova Senha
              </h2>
              <Form layout='vertical' onFinish={updatePassword}>
                <Form.Item
                  label='Nova senha'
                  name='password'
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: 'Digite uma senha de no mínimo 6 dígitos.',
                      min: 6,
                    },
                  ]}
                >
                  <Input.Password size='large' />
                </Form.Item>
                <Form.Item
                  label='Confirmar senha'
                  name='confirmPassword'
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Confirme sua senha.' },
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
                  <Input.Password size='large' />
                </Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  size='large'
                  block
                  loading={loading}
                >
                  Salvar Nova Senha
                </Button>
              </Form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#1E295E' }}>
                Acesso via link de recuperação
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Caso tenha acabado de clicar no link do seu email, aguarde um instante enquanto validamos seu acesso.
              </p>
              <Button type='primary' onClick={() => router.push('/')}>
                Ir para o login
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UpdatePassword;
