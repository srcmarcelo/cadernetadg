import React, { useState } from 'react';
import styled from 'styled-components';
import { GoogleCircleFilled } from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Result, message } from 'antd';
import Image from 'next/image';
import { useSupabaseClient } from '../../services/supabaseClient';

const AuthWrapper = styled.div`
  width: 100%;
  min-height: 92dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: #FFFFFF;
  border-radius: 20px;
  padding: 32px 26px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 12px 32px rgba(30, 41, 94, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GoogleBtn = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1.5px solid #CBD5E1;
  background: #FFFFFF;
  color: #0F172A;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.16s;

  &:hover {
    background: #F8FAFC;
    border-color: #94A3B8;
  }
`;

const DividerText = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0;
  color: #94A3B8;
  font-size: 0.82rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E2E8F0;
  }
`;

const TermsNotice = styled.p`
  margin: 12px 0 0;
  font-size: 0.78rem;
  color: #64748B;
  text-align: center;
  line-height: 1.45;

  a {
    color: #1E295E;
    font-weight: 600;
    text-decoration: underline;
  }
`;

export default function Auth() {
  const supabase = useSupabaseClient();

  const [mode, setMode] = useState('signin');
  const [signInError, setSignInError] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyUserExist = async (email) => {
    const { data } = await supabase
      .from('registered_users')
      .select('id')
      .eq('email', email)
      .limit(1);
    return Array.isArray(data) && data.length > 0;
  };

  const handleSignIn = async (values) => {
    setLoading(true);
    setSignInError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        setSignInError('notVerified');
      } else {
        const alreadyRegistered = await verifyUserExist(values.email.trim());
        setSignInError(alreadyRegistered ? 'credentials' : 'notRegistered');
      }
    }

    setLoading(false);
  };

  const signInWithGoogle = async () => {
    const redirectTo =
      typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (error) {
      setMode('googleError');
    }
  };

  const handleSignUp = async (values) => {
    setLoading(true);
    setSignInError(null);
    const cleanEmail = values.email.trim();

    const alreadyRegistered = await verifyUserExist(cleanEmail);
    if (alreadyRegistered) {
      setMode('alreadyRegistered');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: values.password,
      options: {
        data: {
          user_name: values.user_name.trim(),
        },
      },
    });

    if (!error) {
      setMode('successRegistry');
    } else {
      message.error(error.message || 'Não foi possível criar a conta.');
    }
    setLoading(false);
  };

  const handleRecovery = async (values) => {
    setLoading(true);
    setSignInError(null);
    const cleanEmail = values.email.trim();

    const alreadyRegistered = await verifyUserExist(cleanEmail);
    if (!alreadyRegistered) {
      setSignInError('notRegistered');
      setLoading(false);
      return;
    }

    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/update-password`
        : 'https://cadernetadg.com.br/update-password';

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    });

    if (!error) {
      setMode('recoverySucceed');
    } else {
      message.error('Não foi possível enviar o link de recuperação.');
    }
    setLoading(false);
  };

  const showSpamAdvice = () => {
    Modal.info({
      title: 'Olhe na sua caixa de spam!',
      content: (
        <div>
          <p>
            Para algumas contas, os emails de confirmação podem cair na pasta de SPAM ou Lixo Eletrônico.
          </p>
          <p>
            Caso utilize Gmail, você também pode entrar diretamente clicando em <strong>Continuar com o Google</strong>!
          </p>
        </div>
      ),
    });
  };

  const signInErrors = {
    credentials:
      'Senha incorreta. Caso tenha esquecido, clique em "Esqueci minha senha" abaixo.',
    notRegistered:
      'Email não encontrado. Clique em "Criar nova conta" ou entre com o Google.',
    notVerified:
      'Email ainda não confirmado. Verifique sua caixa de entrada e o SPAM.',
  };

  return (
    <AuthWrapper>
      <AuthCard>
        <Image
          src='/logo.png'
          width={96}
          height={57}
          alt='Logo do Caderneta Digital'
          priority
        />
        <h1
          style={{
            marginTop: 12,
            marginBottom: 2,
            color: '#1E295E',
            fontSize: '1.55rem',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          Caderneta Digital
        </h1>
        <p style={{ marginBottom: 22, color: '#64748B', textAlign: 'center', fontSize: '0.92rem' }}>
          Controle inteligente do seu dinheiro todos os meses
        </p>

        {['signup', 'signin'].includes(mode) && (
          <>
            <GoogleBtn type='button' onClick={signInWithGoogle}>
              <GoogleCircleFilled style={{ fontSize: '1.3rem', color: '#EA4335' }} />
              <span>Continuar com o Google</span>
            </GoogleBtn>
            <DividerText>ou continue com seu email</DividerText>
          </>
        )}

        {signInError && (
          <Alert
            type='error'
            showIcon
            message={signInErrors[signInError]}
            style={{ width: '100%', marginBottom: 14 }}
          />
        )}

        {mode === 'signin' && (
          <Form layout='vertical' onFinish={handleSignIn} style={{ width: '100%' }}>
            <Form.Item
              label='Seu email'
              name='email'
              rules={[{ required: true, type: 'email', message: 'Digite um email válido.' }]}
            >
              <Input size='large' placeholder='voce@exemplo.com' />
            </Form.Item>
            <Form.Item
              label='Sua senha'
              name='password'
              rules={[{ required: true, message: 'Digite sua senha.' }]}
            >
              <Input.Password size='large' placeholder='••••••' />
            </Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              size='large'
              block
              loading={loading}
              style={{ background: '#1E295E', borderColor: '#1E295E', fontWeight: 700 }}
            >
              Entrar
            </Button>
          </Form>
        )}

        {mode === 'signup' && (
          <Form layout='vertical' onFinish={handleSignUp} style={{ width: '100%' }}>
            <Form.Item
              label='Seu nome'
              name='user_name'
              rules={[{ required: true, message: 'Digite seu nome.' }]}
            >
              <Input size='large' placeholder='Como gostaria de ser chamado' />
            </Form.Item>
            <Form.Item
              label='Seu email'
              name='email'
              rules={[{ required: true, type: 'email', message: 'Digite um email válido.' }]}
            >
              <Input size='large' placeholder='voce@exemplo.com' />
            </Form.Item>
            <Form.Item
              label='Crie uma senha'
              name='password'
              rules={[{ required: true, min: 6, message: 'Mínimo de 6 caracteres.' }]}
            >
              <Input.Password size='large' />
            </Form.Item>
            <Form.Item
              label='Confirmar senha'
              name='confirmPassword'
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirme sua senha.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('As senhas devem ser iguais.'));
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
              style={{ background: '#16A34A', borderColor: '#16A34A', fontWeight: 700 }}
            >
              Criar Conta Gratuita
            </Button>

            <TermsNotice>
              Ao se cadastrar você concorda com nossa{' '}
              <a href='/privacy_policies' target='_blank' rel='noopener noreferrer'>
                Política de Privacidade
              </a>{' '}
              e nossos{' '}
              <a href='/terms' target='_blank' rel='noopener noreferrer'>
                Termos e Condições
              </a>
              .
            </TermsNotice>
          </Form>
        )}

        {mode === 'passwordRecovery' && (
          <Form layout='vertical' onFinish={handleRecovery} style={{ width: '100%' }}>
            <Form.Item
              label='Digite seu email cadastrado para receber o link de redefinição'
              name='email'
              rules={[{ required: true, type: 'email', message: 'Digite um email válido.' }]}
            >
              <Input size='large' placeholder='voce@exemplo.com' />
            </Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              size='large'
              block
              loading={loading}
            >
              Enviar link de recuperação
            </Button>
          </Form>
        )}

        {mode === 'successRegistry' && (
          <Result
            status='success'
            title='Confirme seu email!'
            subTitle='Enviamos um link de confirmação para o seu email. Clique nele para ativar sua conta.'
            extra={[
              <Button type='primary' key='login' onClick={() => setMode('signin')}>
                Ir para o login
              </Button>,
              <Button key='spam' onClick={showSpamAdvice}>
                Não recebi o email
              </Button>,
            ]}
          />
        )}

        {mode === 'recoverySucceed' && (
          <Result
            status='success'
            title='Link enviado!'
            subTitle='Verifique seu email para criar uma nova senha.'
            extra={[
              <Button type='primary' key='login' onClick={() => setMode('signin')}>
                Voltar ao login
              </Button>,
              <Button key='spam' onClick={showSpamAdvice}>
                Não recebi o email
              </Button>,
            ]}
          />
        )}

        {mode === 'alreadyRegistered' && (
          <Result
            status='warning'
            title='Este email já possui cadastro'
            subTitle='Entre com sua senha ou utilize a opção "Esqueci minha senha".'
            extra={[
              <Button type='primary' key='login' onClick={() => setMode('signin')}>
                Ir para o login
              </Button>,
            ]}
          />
        )}

        {mode === 'googleError' && (
          <Result
            status='error'
            title='Falha ao conectar com o Google'
            subTitle='Por favor, tente novamente ou acesse utilizando seu email e senha.'
            extra={[
              <Button type='primary' key='login' onClick={() => setMode('signin')}>
                Voltar ao login
              </Button>,
            ]}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 16 }}>
          {mode === 'signin' && (
            <>
              <Button
                type='link'
                onClick={() => {
                  setMode('passwordRecovery');
                  setSignInError(null);
                }}
              >
                Esqueci minha senha
              </Button>
              <Button
                block
                onClick={() => {
                  setMode('signup');
                  setSignInError(null);
                }}
              >
                Não tem conta? Criar nova conta
              </Button>
            </>
          )}

          {mode === 'signup' && (
            <Button
              block
              onClick={() => {
                setMode('signin');
                setSignInError(null);
              }}
            >
              Já tenho uma conta
            </Button>
          )}

          {mode === 'passwordRecovery' && (
            <Button
              block
              onClick={() => {
                setMode('signin');
                setSignInError(null);
              }}
            >
              Voltar para o login
            </Button>
          )}
        </div>
      </AuthCard>
    </AuthWrapper>
  );
}
