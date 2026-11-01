import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CheckOutlined,
  CloseOutlined,
  CloudSyncOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Tag, message } from 'antd';
import { useSelector } from 'react-redux';
import { useSupabaseClient, useUser } from '../../services/supabaseClient';
import { clearData, dispatchSetUserName, syncData } from '../Main/redux';
import {
  getBackgroundSyncing,
  getLastSyncedAt,
  getUserInfo,
} from '../Main/redux/reducer';

const Card = styled.div`
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
`;

const AvatarCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1E295E 0%, #4F46E5 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionsStack = styled.div`
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
`;

export default function Profile({ dispatch }) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const userInfo = useSelector(getUserInfo);
  const lastSyncedAt = useSelector(getLastSyncedAt);
  const backgroundSyncing = useSelector(getBackgroundSyncing);

  const currentName =
    userInfo?.name || user?.user_metadata?.user_name || '';

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentName);
  const [saving, setSaving] = useState(false);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      message.warning('Digite um nome válido.');
      return;
    }
    setSaving(true);
    await dispatchSetUserName(dispatch, nameInput.trim(), supabase, user);
    setSaving(false);
    setEditing(false);
    message.success('Nome atualizado com sucesso!');
  };

  const handleClearData = () => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir todos os dados da sua caderneta?',
      icon: <ExclamationCircleOutlined />,
      content:
        'Ao confirmar, todos os recebimentos, despesas, cartões e devedores serão apagados permanentemente.',
      okText: 'Sim, apagar tudo',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await clearData(dispatch, supabase, user);
        message.success('Todos os dados foram limpos.');
      },
    });
  };

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <Card className='profile-screen'>
      <AvatarCircle>
        <UserOutlined />
      </AvatarCircle>

      {editing ? (
        <form
          onSubmit={handleSaveName}
          style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', maxWidth: 340 }}
        >
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder='Seu nome'
          />
          <Button
            type='primary'
            htmlType='submit'
            icon={<CheckOutlined />}
            loading={saving}
            onMouseDown={(e) => e.preventDefault()}
          />
          <Button
            icon={<CloseOutlined />}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setEditing(false)}
          />
        </form>
      ) : (
        <NameRow>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#0F172A' }}>
            {currentName || '(Insira seu nome)'}
          </h2>
          <Button
            size='small'
            icon={<EditOutlined />}
            onClick={() => {
              setNameInput(currentName);
              setEditing(true);
            }}
          />
        </NameRow>
      )}

      <div style={{ color: '#64748B', fontSize: '0.95rem' }}>{user?.email}</div>

      <Tag color='blue' icon={<CloudSyncOutlined spin={backgroundSyncing} />}>
        {formattedSyncTime
          ? `Sincronizado na nuvem às ${formattedSyncTime}`
          : 'Sincronização em nuvem ativa'}
      </Tag>

      <ActionsStack>
        <Button
          icon={<CloudSyncOutlined />}
          loading={backgroundSyncing}
          onClick={() => {
            syncData(dispatch, supabase, user, { silent: true });
            message.success('Dados sincronizados com a nuvem!');
          }}
        >
          Sincronizar agora
        </Button>

        <Button
          icon={<LogoutOutlined />}
          onClick={() => supabase.auth.signOut()}
        >
          Sair da conta
        </Button>

        <Button danger icon={<DeleteOutlined />} onClick={handleClearData}>
          Limpar todos os dados
        </Button>
      </ActionsStack>
    </Card>
  );
}
