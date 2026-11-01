import React, { useState } from 'react';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  StopOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, Tag, Tooltip, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { getSelectedMonth } from '../../../containers/Main/redux/reducer';
import {
  createFixedReceipt,
  deleteFixedReceipt,
  updateFixedReceipt,
  updateFixedReceiptMonthStatus,
} from '../../../containers/Income/redux';
import { useMonthlyFinancialView } from '../../../services/useMonthlyFinancialView';
import CurrencyInput from '../../CurrencyInput';
import { formatBRL } from '../../../utils/currency';
import { formatMonthYear } from '../../../utils/monthUtils';
import {
  EmptyBox,
  FieldLabel,
  FormRow,
  HeaderActions,
  IconActionBtn,
  InlineEditorBox,
  ItemActions,
  ItemAmount,
  ItemInfo,
  ItemName,
  ItemsList,
  ItemTitleRow,
  ListItemCard,
  SectionCard,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  SectionTitleGroup,
  TotalBanner,
} from '../../SharedCardStyles';

function ReceiptFormEditor({ initialName = '', initialValue = 0, onSave, onCancel, saving }) {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning('Digite um nome para identificar o recebimento.');
      return;
    }
    if (value <= 0) {
      message.warning('Informe um valor maior que zero.');
      return;
    }
    onSave({ name: name.trim(), value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <InlineEditorBox>
        <FormRow>
          <div>
            <FieldLabel>Descrição</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ex: Salário, Aluguel recebido'
              autoFocus
            />
          </div>
          <div>
            <FieldLabel>Valor mensal</FieldLabel>
            <CurrencyInput value={value} onChange={setValue} compact />
          </div>
        </FormRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button size='small' icon={<CloseOutlined />} onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            size='small'
            type='primary'
            htmlType='submit'
            icon={<CheckOutlined />}
            loading={saving}
            style={{ background: '#16A34A', borderColor: '#16A34A' }}
          >
            Salvar
          </Button>
        </div>
      </InlineEditorBox>
    </form>
  );
}

export default function FixedReceipts() {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();
  const selectedMonth = useSelector(getSelectedMonth);
  const { resolvedFixedReceipts } = useMonthlyFinancialView();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const items = [...resolvedFixedReceipts].reverse();
  const pendingTotal = items.reduce(
    (sum, it) =>
      !it.effectiveReceived && !it.effectiveDisabled ? sum + it.effectiveValue : sum,
    0
  );

  const handleCreate = async ({ name, value }) => {
    setSaving(true);
    try {
      await createFixedReceipt({ dispatch, supabase, user, name, value });
      setAdding(false);
      message.success(`Recebimento "${name}" adicionado.`);
    } catch {
      message.error('Erro ao salvar recebimento.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, { name, value }) => {
    setSaving(true);
    try {
      await updateFixedReceipt({
        dispatch,
        supabase,
        user,
        id,
        patch: { name, value },
      });
      setEditingId(null);
      message.success(`Recebimento "${name}" atualizado.`);
    } catch {
      message.error('Erro ao atualizar recebimento.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReceived = async (item) => {
    const nextReceived = !item.effectiveReceived;
    await updateFixedReceiptMonthStatus({
      dispatch,
      supabase,
      user,
      id: item.id,
      selectedMonth,
      monthPatch: { received: nextReceived },
    });
    if (nextReceived) {
      message.success(`Recebimento de ${item.name} confirmado em ${formatMonthYear(selectedMonth)}.`);
    }
  };

  const handleToggleDisabled = async (item) => {
    await updateFixedReceiptMonthStatus({
      dispatch,
      supabase,
      user,
      id: item.id,
      selectedMonth,
      monthPatch: { disabled: !item.effectiveDisabled },
    });
  };

  const confirmDelete = (item) => {
    Modal.confirm({
      title: `Excluir "${item.name}" de todos os meses?`,
      icon: <ExclamationCircleOutlined />,
      content:
        'Para ignorar apenas neste mês, use o botão de pausar ao lado. Excluir removerá o recebimento fixo permanentemente.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteFixedReceipt({ dispatch, supabase, user, id: item.id });
        message.success('Recebimento fixo removido.');
      },
    });
  };

  return (
    <SectionCard className='fixedReceiptsCard'>
      <SectionHeader>
        <SectionTitleGroup>
          <SectionTitle>Recebimentos Fixos</SectionTitle>
          <SectionSubtitle>Entradas recorrentes em todos os meses</SectionSubtitle>
        </SectionTitleGroup>
        <HeaderActions>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
            disabled={adding}
            style={{ background: '#16A34A', borderColor: '#16A34A' }}
          >
            Adicionar
          </Button>
        </HeaderActions>
      </SectionHeader>

      {adding && (
        <ReceiptFormEditor
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {items.length === 0 && !adding ? (
        <EmptyBox>
          <span>Nenhum recebimento fixo cadastrado (ex: Salário).</span>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setAdding(true)}
            style={{ background: '#16A34A', borderColor: '#16A34A' }}
          >
            Cadastrar primeiro recebimento
          </Button>
        </EmptyBox>
      ) : (
        items.length > 0 && (
          <>
            <TotalBanner className='fixedReceiptsTotal'>
              <span>Falta receber neste mês:</span>
              <span>{formatBRL(pendingTotal)}</span>
            </TotalBanner>
            <ItemsList>
              {items.map((item) =>
                editingId === item.id ? (
                  <ReceiptFormEditor
                    key={item.id}
                    initialName={item.name}
                    initialValue={item.effectiveValue}
                    onSave={(vals) => handleUpdate(item.id, vals)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <ListItemCard
                    key={item.id}
                    $muted={item.effectiveReceived || item.effectiveDisabled}
                  >
                    <ItemInfo>
                      <ItemTitleRow>
                        <ItemName
                          $strike={item.effectiveReceived || item.effectiveDisabled}
                        >
                          {item.name}
                        </ItemName>
                        {item.effectiveReceived && <Tag color='success'>Recebido</Tag>}
                        {item.effectiveDisabled && <Tag>Ignorado no mês</Tag>}
                      </ItemTitleRow>
                      <ItemAmount
                        $color={
                          item.effectiveReceived || item.effectiveDisabled
                            ? '#64748B'
                            : '#16A34A'
                        }
                      >
                        {formatBRL(item.effectiveValue)}
                      </ItemAmount>
                    </ItemInfo>

                    <ItemActions>
                      <Tooltip
                        title={
                          item.effectiveReceived
                            ? 'Desmarcar recebimento neste mês'
                            : 'Confirmar que já recebeu neste mês'
                        }
                      >
                        <IconActionBtn
                          type='button'
                          $bg={item.effectiveReceived ? '#DCFCE7' : '#F0FDF4'}
                          $border='#86EFAC'
                          $color='#15803D'
                          onClick={() => handleToggleReceived(item)}
                          disabled={item.effectiveDisabled}
                        >
                          {item.effectiveReceived ? <UndoOutlined /> : <CheckOutlined />}
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip
                        title={
                          item.effectiveDisabled
                            ? 'Reativar neste mês'
                            : 'Ignorar apenas neste mês'
                        }
                      >
                        <IconActionBtn
                          type='button'
                          onClick={() => handleToggleDisabled(item)}
                        >
                          <StopOutlined />
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip title='Editar'>
                        <IconActionBtn
                          type='button'
                          $color='#D97706'
                          onClick={() => {
                            setAdding(false);
                            setEditingId(item.id);
                          }}
                        >
                          <EditOutlined />
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip title='Excluir'>
                        <IconActionBtn
                          type='button'
                          $color='#DC2626'
                          onClick={() => confirmDelete(item)}
                        >
                          <DeleteOutlined />
                        </IconActionBtn>
                      </Tooltip>
                    </ItemActions>
                  </ListItemCard>
                )
              )}
            </ItemsList>
          </>
        )
      )}
    </SectionCard>
  );
}
