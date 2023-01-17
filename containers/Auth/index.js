import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button, Form, Input, message, Result } from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';
import {
  ChangeModeButton,
  Container,
  ErrorLabel,
  RegistrationForm,
} from './styles';

export default function Auth() {
  const supabase = useSupabaseClient();

  const [mode, setMode] = useState('signin');
  const [signInError, setSignInError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase.auth.resetPasswordForEmail(values.email);

    if (!error) {
      setMode('recoverySucceed');
    } else {
      message.error('Algo deu errado :(');
    }
    setLoading(false);
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
        title='Confirme seu email!'
        subTitle='Te enviamos um email com o link de confirmação, clique nesse link para confirmar e faça login!'
        extra={[
          <Button
            type='primary'
            key='goToLogin'
            onClick={() => setMode('signin')}
          >
            Ir para o login
          </Button>,
          <Button key='didNotReceived'>Não recebi o email</Button>,
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
          <Button key='didNotReceived'>Não recebi o email</Button>,
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

  const Main = {
    signup: <SignUpForm />,
    signin: <SignInForm />,
    passwordRecovery: <PasswordRecoveryForm />,
    successRegistry: <ResgistrySucceed />,
    alreadyRegistered: <AlreadyRegistered />,
    recoverySucceed: <RecoverySucceed />,
  };

  const SignModes = {
    signin: {
      label: 'Criar Conta',
      mode: 'signup',
      color: '#232c68',
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
      'Email não cadastrado. Você precisa criar uma conta para acessar a Caderneta, clique em "Criar Conta" ou prossiga com os outros métodos.',
    notVerified:
      'Email não confirmado. Clique no link no email que te enviamos para verificar. Olhe também na caixa de spam.',
  };

  const RenderErrorLabel = ({ error }) => (
    <ErrorLabel>{signInErrors[error]}</ErrorLabel>
  );

  return (
    <Container>
      <h1>Caderneta Digital</h1>
      <p style={{ color: 'black' }}>Controle seu dinheiro!</p>
      {Main[mode]}
      {signInError && <RenderErrorLabel error={signInError} />}
      {['signin'].includes(mode) && (
        <ChangeModeButton
          onClick={() => {
            setMode('passwordRecovery');
            setSignInError(null);
          }}
          color='grey'
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
          }}
          color={SignModes[mode].color}
        >
          {SignModes[mode].label}
        </ChangeModeButton>
      )}
    </Container>
  );
}
