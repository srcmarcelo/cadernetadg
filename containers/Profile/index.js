import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from 'antd';
import React from 'react';
import { Container, Content } from './styles';

export default function Profile() {
  const supabase = useSupabaseClient();
  const user = useUser();

  return (
    <Container>
      <Content>
        <div style={{color: 'white', margin: '30px', fontSize: '2rem'}}>{user.email}</div>
        <Button onClick={() => supabase.auth.signOut()}>Sair da conta</Button>
      </Content>
    </Container>
  );
}
