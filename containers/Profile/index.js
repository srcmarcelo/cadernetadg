import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Modal } from 'antd';
import React from 'react';
import { clearData, syncData } from '../Main/redux';
import { Container, Content, ProfileButton } from './styles';

export default function Profile({dispatch}) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const confirmClearData = async () => {
    await clearData(supabase, user);
    await syncData(dispatch, supabase, user);
  };

  const handleClearData = () =>
    Modal.confirm({
      title: 'Tem certeza que deseja excluir todos os dados da sua caderneta?',
      content:
        'Ao cliclar em confirmar, todos os dados serão apagados e você terá que registra-los novamente.',
      onOk: confirmClearData,
    });

  return (
    <Container>
      <Content>
        <div style={{ color: 'white', fontSize: '1.3rem' }}>
          {user.user_metadata.user_name}
        </div>
        <div style={{ color: 'white', margin: '30px', fontSize: '1.3rem' }}>
          {user.email}
        </div>
        <ProfileButton onClick={() => supabase.auth.signOut()}>
          Sair da conta
        </ProfileButton>
        <ProfileButton danger onClick={handleClearData}>
          Limpar todos os dados
        </ProfileButton>
      </Content>
    </Container>
  );
}
