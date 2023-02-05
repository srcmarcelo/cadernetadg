import { GoogleCircleFilled } from '@ant-design/icons';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button, Form, Input, message, Modal, Result } from 'antd';
import _ from 'lodash';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import {
  ChangeModeButton,
  Container,
  ErrorLabel,
  GoogleButton,
  RegistrationForm,
  Terms,
  TermsLinks,
  VideoModalContainer,
} from './styles';

export default function Auth() {
  const supabase = useSupabaseClient();

  const [mode, setMode] = useState('signin');
  const [signInError, setSignInError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    setPageLoading(false);
    setTimeout(() => setVideoModalOpen(true), 2000);
  }, []);

  const verifyUserExist = async (email) => {
    let { data } = await supabase
      .from('registered_users')
      .select('*')
      .eq('email', email);
    return !_.isEmpty(data);
  };

  const SignIn = async (values) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error?.message.includes('Email')) {
      setSignInError('notVerified');
    } else {
      const alreadyRegistered = await verifyUserExist(values.email);
      if (!alreadyRegistered) {
        setSignInError('notRegistered');
      } else {
        setSignInError('credentials');
      }
    }
    setLoading(false);
  };

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      setMode('googleError');
    }
  }

  const SignUp = async (values) => {
    setLoading(true);
    const alreadyRegistered = await verifyUserExist(values.email);
    if (alreadyRegistered) {
      setMode('alreadyRegistered');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          user_name: values.user_name,
        },
      },
    });
    if (!error) {
      setMode('successRegistry');
    } else {
      message.error('Algo deu errado :(');
    }
    setLoading(false);
  };

  const RecoverySubmit = async (values) => {
    setLoading(true);
    const alreadyRegistered = await verifyUserExist(values.email);
    if (!alreadyRegistered) {
      setSignInError('notRegistered');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: 'http://cadernetadg.com.br/update-password',
    });

    if (!error) {
      setMode('recoverySucceed');
    } else {
      message.error('Algo deu errado :(');
    }
    setLoading(false);
  };

  const SpamAdvice = () => {
    Modal.info({
      title: 'Olhe na sua caixa de spam!',
      content: (
        <div>
          <p>
            Infelizmente, para algumas contas, nossos emails caem na caixa de
            SPAM. Verifique a sua e marque o email como confiável, depois clique
            no link.
          </p>
          <p>
            Não se preocupe, o link é confiável! O responsável pelo site sou eu,
            Marcelo Crístian. Se quiser ou precisar, pode entrar em contato
            comigo no número (87) 98817-5129.
          </p>
          <p>
            Caso não esteja nem na caixa de SPAM, favor aguardar 2 minutos. Caso
            não apareça mesmo assim, tente se cadastrar novamente. Caso persista
            o erro, favor enviar mensagem via Whatsapp para o número acima.
          </p>
        </div>
      ),
      onOk() {},
    });
  };

  const emailWarning = () => {
    Modal.warning({
      title: 'Pode demorar uns minutinhos...',
      content:
        'Infelizmente, para algumas contas, o email de confirmação está demorando até 10 minutos para chegar. Caso seu email seja "gmail", clique em "Continuar com o Google" para ser mais rápido!',
    });
  };

  const SignInForm = () => (
    <RegistrationForm layout='vertical' onFinish={SignIn}>
      <Form.Item
        label={<span style={{ color: 'white' }}>Seu email</span>}
        style={{ width: '100%' }}
        name='email'
        requiredMark='optional'
        rules={[
          {
            required: true,
            message: 'Digite um email válido.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={<span style={{ color: 'white' }}>Sua senha</span>}
        name='password'
        requiredMark='optional'
        rules={[
          {
            required: true,
            message: 'Digite sua senha.',
          },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Button type='primary' htmlType='submit' loading={loading}>
        ENTRAR
      </Button>
    </RegistrationForm>
  );

  const SignUpForm = () => (
    <RegistrationForm layout='vertical' onFinish={SignUp}>
      <Form.Item
        label={<span style={{ color: 'white' }}>Seu nome</span>}
        style={{ width: '100%' }}
        name='user_name'
        requiredMark='optional'
        rules={[
          {
            required: true,
            message: 'Digite seu nome.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={<span style={{ color: 'white' }}>Seu email</span>}
        style={{ width: '100%' }}
        name='email'
        requiredMark='optional'
        rules={[
          {
            required: true,
            message: 'Digite um email válido.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={<span style={{ color: 'white' }}>Sua senha</span>}
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
              return Promise.reject(new Error('As senhas devem ser iguais!'));
            },
          }),
        ]}
      >
        <Input.Password style={{ width: '100%' }} />
      </Form.Item>
      <Button type='primary' htmlType='submit' loading={loading}>
        Criar Conta
      </Button>
    </RegistrationForm>
  );

  const PasswordRecoveryForm = () => (
    <RegistrationForm layout='vertical' onFinish={RecoverySubmit}>
      <Form.Item
        label={
          <span style={{ color: 'white', textAlign: 'center' }}>
            Digite o email cadastrado abaixo. Te enviaremos um link de
            recuperação.
          </span>
        }
        style={{ width: '100%' }}
        name='email'
        requiredMark='optional'
        rules={[
          {
            required: true,
            message: 'Digite um email válido.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Button type='primary' htmlType='submit' loading={loading}>
        RECUPERAR
      </Button>
    </RegistrationForm>
  );

  const ResgistrySucceed = () => (
    <div>
      <Result
        status='success'
        title='Entre no seu email para confirmar!'
        subTitle='Acabamos de te enviar o link de confirmação, entre no seu email e clique nesse link para confirmar!'
        extra={[
          <Button
            type='primary'
            key='goToLogin'
            onClick={() => setMode('signin')}
          >
            Ir para o login
          </Button>,
          <Button key='didNotReceived' onClick={SpamAdvice}>
            Não recebi o email
          </Button>,
        ]}
      />
    </div>
  );

  const RecoverySucceed = () => (
    <div>
      <Result
        status='success'
        title='Link de recuperação enviado!'
        subTitle='Enviamos o link de recuperação para o seu email.'
        extra={[
          <Button
            type='primary'
            key='goToLogin'
            onClick={() => setMode('signin')}
          >
            Ir para o login
          </Button>,
          <Button key='didNotReceived' onClick={SpamAdvice}>
            Não recebi o email
          </Button>,
        ]}
      />
    </div>
  );

  const AlreadyRegistered = () => (
    <div>
      <Result
        status='error'
        title='Email já cadastrado'
        subTitle='Caso tenha esquecido a senha, clique em "esqueci senha" na tela de login para recupera-la.'
        extra={[
          <Button
            type='primary'
            key='goToLogin'
            onClick={() => setMode('signin')}
          >
            Ir para o login
          </Button>,
        ]}
      />
    </div>
  );

  const ErrorWithGoogle = () => (
    <div>
      <Result
        status='error'
        title='Algo deu errado'
        subTitle='Algo deu errado ao tentar continuar com o Google. Por favor, utilize o email.'
        extra={[
          <Button
            type='primary'
            key='goToLogin'
            onClick={() => setMode('signin')}
          >
            Ir para o login
          </Button>,
        ]}
      />
    </div>
  );

  const Main = {
    signup: <SignUpForm />,
    signin: <SignInForm />,
    passwordRecovery: <PasswordRecoveryForm />,
    successRegistry: <ResgistrySucceed />,
    alreadyRegistered: <AlreadyRegistered />,
    recoverySucceed: <RecoverySucceed />,
    googleError: <ErrorWithGoogle />,
  };

  const SignModes = {
    signin: {
      label: 'Criar Conta',
      mode: 'signup',
      color: '#368f42',
    },
    signup: {
      label: 'Já tenho conta',
      mode: 'signin',
      color: 'orange',
    },
  };

  const signInErrors = {
    credentials:
      'Senha inválida. Caso tenha esquecido, clique em "Esqueci Senha" no botão abaixo para redefinir.',
    notRegistered:
      'Email não cadastrado. Você precisa criar uma conta para acessar a Caderneta, clique em "Continuar com o Google" ou "Criar Conta" para se cadastrar.',
    notVerified:
      'Email não confirmado. Clique no link no email que te enviamos para verificar. Olhe também na caixa de spam.',
  };

  const RenderErrorLabel = ({ error }) => (
    <ErrorLabel>{signInErrors[error]}</ErrorLabel>
  );

  const RenderTerms = () => (
    <Terms>
      Ao se cadastrar você concorda com nossa{' '}
      {
        <TermsLinks
          href='/privacy_policies'
          target='_blank'
          rel='noopener noreferrer'
        >
          Política de Privacidade
        </TermsLinks>
      }{' '}
      e nossos{' '}
      {
        <TermsLinks href='/terms' target='_blank' rel='noopener noreferrer'>
          Termos e Condições
        </TermsLinks>
      }
      .
    </Terms>
  );

  const RenderGoogleButton = () => (
    <GoogleButton onClick={signInWithGoogle}>
      <GoogleCircleFilled style={{ fontSize: '1.5rem', marginTop: '3px' }} />
      Continuar com o Google
    </GoogleButton>
  );

  const RenderSeparator = () => (
    <div style={{ margin: '15px 0px', color: '#232c68', alignSelf: 'center', justifySelf: 'center' }}>ou</div>
  );

  const RenderVideoModal = () => (
    <Modal
      open={videoModalOpen}
      onOk={() => {
        setVideoModalOpen(false),
          open('https://instagram.com/srcmarcelo?igshid=NTA5ZTk1NTc=');
      }}
      onCancel={() => setVideoModalOpen(false)}
      cancelText='Já assisti'
      okText='Ir para o vídeo'
      closable={false}
      title={
        <h3 style={{ textAlign: 'center', margin: 0 }}>
          O que é o Caderneta Digital?
        </h3>
      }
      centered={true}
    >
      <VideoModalContainer>
        <div
          style={{
            textAlign: 'center',
            marginBottom: '10px',
            fontSize: '1rem',
          }}
        >
          Assista o vídeo abaixo na minha conta do Instagram para saber do que
          se trata!
        </div>
        <Image
          src='/InstagramVideo.jpeg'
          width={300}
          height={298}
          alt='Frame do vídeo de anúncio do Caderneta Digital'
          onClick={() => {
            setVideoModalOpen(false),
              open('https://instagram.com/srcmarcelo?igshid=NTA5ZTk1NTc=');
          }}
        />
      </VideoModalContainer>
    </Modal>
  );

  if (pageLoading)
    return (
      <Container>
        <Image
          src='/logo.png'
          width={125}
          height={74}
          alt='Logo do Caderneta Digital'
        />
      </Container>
    );

  return (
    <Container>
      <Image
        src='/logo.png'
        width={125}
        height={74}
        alt='Logo do Caderneta Digital'
      />
      <h1 style={{ marginTop: '10px', marginBottom: 0, color: '#232C68' }}>
        Caderneta Digital
      </h1>
      <p style={{ marginBottom: '20px', color: '#232C68' }}>
        Controle seu dinheiro!
      </p>
      {['signup', 'signin'].includes(mode) && <RenderGoogleButton />}
      {['signup', 'signin'].includes(mode) && <RenderSeparator />}
      {Main[mode]}
      {['signup'].includes(mode) && <RenderTerms />}
      {signInError && <RenderErrorLabel error={signInError} />}
      {['signin'].includes(mode) && (
        <ChangeModeButton
          onClick={() => {
            setMode('passwordRecovery');
            setSignInError(null);
          }}
          color='#C83126'
        >
          Esqueci Senha
        </ChangeModeButton>
      )}
      {['passwordRecovery'].includes(mode) && (
        <ChangeModeButton
          onClick={() => {
            setMode('signin');
            setSignInError(null);
          }}
          color='#232c68'
        >
          Ir para login
        </ChangeModeButton>
      )}
      {['signup', 'signin'].includes(mode) && (
        <ChangeModeButton
          onClick={() => {
            setMode(SignModes[mode].mode);
            setSignInError(null);
            SignModes[mode].mode === 'signup' && emailWarning();
          }}
          color={SignModes[mode].color}
        >
          {SignModes[mode].label}
        </ChangeModeButton>
      )}
      <RenderVideoModal />
    </Container>
  );
}
