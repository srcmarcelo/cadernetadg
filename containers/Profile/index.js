import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, Modal } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { clearData, dispatchSetUserName, syncData } from '../Main/redux';
import { getUserInfo } from '../Main/redux/reducer';
import {
  ButtonsContainer,
  Container,
  Content,
  DisplayName,
  EditButton,
  EditNameButton,
  FormContainer,
  NameContainer,
  ProfileButton,
  TitleInput,
  TitleInputContainer,
} from './styles';

export default function Profile({ dispatch }) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const userInfo = useSelector(getUserInfo);

  const [editing, setEditing] = useState(false);

  const confirmClearData = async () => {
    await clearData(dispatch, supabase, user);
    await syncData(dispatch, supabase, user);
    window.location.reload();
  };

  const handleClearData = () =>
    Modal.confirm({
      title: 'Tem certeza que deseja excluir todos os dados da sua caderneta?',
      content:
        'Ao cliclar em confirmar, todos os dados serão apagados e você terá que registra-los novamente.',
      onOk: confirmClearData,
      okText: 'Confirmar',
    });

  const handleEditName = async (values) => {
    await dispatchSetUserName(dispatch, values.userName, supabase, user);
    setEditing(false);
  };

  const RenderFormName = ({ name }) => (
    <FormContainer
      onFinish={(values) => handleEditName(values)}
      initialValues={{ userName: name }}
    >
      <TitleInputContainer>
        <Form.Item
          style={{ margin: 0 }}
          name='userName'
          rules={[
            {
              required: true,
              message: 'Digite um novo nome.',
            },
          ]}
        >
          <TitleInput key={'user_name'} id={'user_name'} />
        </Form.Item>
      </TitleInputContainer>
      <ButtonsContainer>
        <EditNameButton color='green' htmlType='submit'>
          <CheckOutlined />
        </EditNameButton>
        <EditNameButton color='red' onClick={() => setEditing(false)}>
          <CloseOutlined />
        </EditNameButton>
      </ButtonsContainer>
    </FormContainer>
  );

  return (
    <Container>
      <Content>
        <NameContainer>
          {editing ? (
            <RenderFormName
              name={userInfo.name || user.user_metadata.user_name}
            />
          ) : (
            <>
              <DisplayName>
                {userInfo.name || user.user_metadata.user_name || '(insira seu nome)'}
              </DisplayName>
              <EditButton color='orange' onClick={() => setEditing(true)}>
                <EditOutlined />
              </EditButton>
            </>
          )}
        </NameContainer>
        <div style={{ color: 'white', margin: '30px', fontSize: '1.2rem' }}>
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
