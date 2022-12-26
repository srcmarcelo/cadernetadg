import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';
import { Container, RegistrationForm } from './styles';

export default function Auth() {
  const supabase = useSupabaseClient();

  const [creating, setCreating] = useState(false);

  const SignIn = async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
  };

  const SignUp = async (values) => {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          user_name: values.user_name,
        }
      }
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

  return (
    <Container>
      <h1>Caderneta Digital</h1>
      <p>Controle seu dinheiro!</p>
      {creating ? <SignUpForm /> : <SignInForm />}
      <Button
        onClick={() => setCreating(!creating)}
        style={{
          backgroundColor: creating ? 'orange' : 'lightgreen',
          margin: '40px',
          color: 'white'
        }}
      >
        {creating ? 'Já tenho conta' : 'CRIAR CONTA'}
      </Button>
    </Container>
  );
}
