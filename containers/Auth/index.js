import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button, Form, Input, message } from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';
import { Container, RegistrationForm } from './styles';

export default function Auth() {
  const supabase = useSupabaseClient();

  const [mode, setMode] = useState('signin');
  const [confirmationSent, setConfirmationSent] = useState(false);

  const verifyUserExist = async (email) => {
    let { data } = await supabase
      .from('current_balance')
      .select('*')
      .eq('email', email);
    return !_.isEmpty(data);
  };

  const SignIn = async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
  };

  const SignUp = async (values) => {
    const alreadyRegistered = await verifyUserExist(values.email);
    console.log('alreadyRegistered:', alreadyRegistered);
    if (alreadyRegistered) {
      message.warning('Usuário já cadastrado.');
      setMode('signin');
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
      message.success('Entre no seu email para verificar seu registro!');
      setMode('signin');
      setConfirmationSent(true);
    } else {
      message.error('Algo deu errado :(');
    }
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
            message: 'Digite sua senha (6 digitos).',
          },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Button type='primary' htmlType='submit'>
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
        name='password'
        requiredMark='optional'
        rules={[
          {
            required: true,
            message: 'Digite uma senha de 6 dígitos.',
          },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label={<span style={{ color: 'white' }}>Confirmar senha</span>}
        name='confirmPassword'
        requiredMark='optional'
        rules={[
          {
            required: true,
            message: 'Digite uma senha de 6 dígitos.',
          },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Button type='primary' htmlType='submit'>
        Criar Conta
      </Button>
    </RegistrationForm>
  );

  const ChangeModeButton = ({ label, mode, color }) => (
    <Button
      onClick={() => setMode(mode)}
      style={{
        backgroundColor: color,
        margin: confirmationSent ? '0px' : '40px',
        color: 'white',
        width: '150px',
      }}
    >
      {label}
    </Button>
  );

  const Main = {
    signup: <SignUpForm />,
    signin: <SignInForm />,
  };

  const SignModes = {
    signin: {
      label: 'Criar Conta',
      mode: 'signup',
      color: 'lightgreen',
    },
    signup: {
      label: 'Já tenho conta',
      mode: 'signin',
      color: 'orange',
    },
  };

  return (
    <Container>
      <h1>Caderneta Digital</h1>
      <p>Controle seu dinheiro!</p>
      {Main[mode]}
      {confirmationSent && (
        <p style={{margin: '20px', fontSize: '1rem'}}>
          Foi enviado um link de confirmação. Entre no seu
          email cadastrado e clique no link para confirmar!
        </p>
      )}
      {['signup', 'signin'].includes(mode) && (
        <ChangeModeButton {...SignModes[mode]} />
      )}
    </Container>
  );
}
