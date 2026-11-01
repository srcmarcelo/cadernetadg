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
import { Button, Input, Modal, Tag, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { getSelectedMonth } from '../../../containers/Main/redux/reducer';
import {
  createExtraReceipt,
  deleteExtraReceipt,
  updateExtraReceipt,
} from '../../../containers/Income/redux';
import { useMonthlyFinancialView } from '../../../services/useMonthlyFinancialView';
import CurrencyInput from '../../CurrencyInput';
import { formatBRL } from '../../../utils/currency';
import { formatMonthYear } from '../../../utils/monthUtils';
import {
  EmptyBox,
  FieldLabel,
  FormActionsRow,
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

function ExtraReceiptEditor({ initialName = '', initialValue = 0, onSave, onCancel, saving }) {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning('Digite uma descrição para o ganho extra.');
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
              placeholder='Ex: 13º Salário, Freelance, Venda'
            />
          </div>
          <div>
            <FieldLabel>Valor</FieldLabel>
            <CurrencyInput value={value} onChange={setValue} compact />
          </div>
        </FormRow>
        <FormActionsRow>
          <Button
            icon={<CloseOutlined />}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type='primary'
            htmlType='submit'
            icon={<CheckOutlined />}
            loading={saving}
            onMouseDown={(e) => e.preventDefault()}
            style={{ background: '#16A34A', borderColor: '#16A34A' }}
          >
            Salvar
          </Button>
        </FormActionsRow>
      </InlineEditorBox>
    </form>
  );
}

export default function ExtraReceipts() {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();
  const selectedMonth = useSelector(getSelectedMonth);
  const { resolvedExtraReceipts } = useMonthlyFinancialView();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const items = [...resolvedExtraReceipts].reverse();
  const pendingTotal = items.reduce(
    (sum, it) =>
      !it.effectiveReceived && !it.effectiveDisabled ? sum + it.effectiveValue : sum,
    0
  );

  const handleCreate = async ({ name, value }) => {
    setSaving(true);
    try {
      await createExtraReceipt({
        dispatch,
        supabase,
        user,
        name,
        value,
        selectedMonth,
      });
      setAdding(false);
      message.success(`Ganho extra adicionado em ${formatMonthYear(selectedMonth)}.`);
    } catch {
      message.error('Erro ao salvar ganho extra.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, { name, value }) => {
    setSaving(true);
    try {
      await updateExtraReceipt({
        dispatch,
        supabase,
        user,
        id,
        patch: { name, value },
        selectedMonth,
      });
      setEditingId(null);
      message.success('Ganho extra atualizado.');
    } catch {
      message.error('Erro ao atualizar ganho extra.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReceived = async (item) => {
    const nextReceived = !item.effectiveReceived;
    await updateExtraReceipt({
      dispatch,
      supabase,
      user,
      id: item.id,
      patch: { received: nextReceived },
      selectedMonth,
    });
    if (nextReceived) {
      message.success(`Recebimento "${item.name}" confirmado!`);
    }
  };

  const handleToggleDisabled = async (item) => {
    await updateExtraReceipt({
      dispatch,
      supabase,
      user,
      id: item.id,
      patch: { disabled: !item.effectiveDisabled },
      selectedMonth,
    });
  };

  const confirmDelete = (item) => {
    Modal.confirm({
      title: `Excluir "${item.name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Este recebimento extra será removido.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteExtraReceipt({ dispatch, supabase, user, id: item.id });
        message.success('Recebimento extra removido.');
      },
    });
  };

  return (
    <SectionCard className='extraReceiptsCard'>
      <SectionHeader>
        <SectionTitleGroup>
          <SectionTitle>Ganhos Extras</SectionTitle>
          <SectionSubtitle>
            Entradas pontuais de {formatMonthYear(selectedMonth)}
          </SectionSubtitle>
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
            Novo Ganho Extra
          </Button>
        </HeaderActions>
      </SectionHeader>

      {adding && (
        <ExtraReceiptEditor
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {items.length === 0 && !adding ? (
        <EmptyBox>
          <span>Nenhum ganho extra em {formatMonthYear(selectedMonth)}.</span>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setAdding(true)}
            style={{ background: '#16A34A', borderColor: '#16A34A' }}
          >
            Adicionar ganho extra
          </Button>
        </EmptyBox>
      ) : (
        items.length > 0 && (
          <>
            <TotalBanner className='extraReceiptsTotal'>
              <span>Extras a receber no mês:</span>
              <span>{formatBRL(pendingTotal)}</span>
            </TotalBanner>
            <ItemsList>
              {items.map((item) =>
                editingId === item.id ? (
                  <ExtraReceiptEditor
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
                        {item.effectiveReceived && (
                          <Tag color='success' style={{ margin: 0 }}>
                            Recebido
                          </Tag>
                        )}
                        {item.effectiveDisabled && (
                          <Tag style={{ margin: 0 }}>Ignorado</Tag>
                        )}
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
                      <IconActionBtn
                        type='button'
                        $bg={item.effectiveReceived ? '#F8FAFC' : '#F0FDF4'}
                        $border={item.effectiveReceived ? '#CBD5E1' : '#86EFAC'}
                        $color={item.effectiveReceived ? '#475569' : '#15803D'}
                        onClick={() => handleToggleReceived(item)}
                        disabled={item.effectiveDisabled}
                        style={{ flex: 1 }}
                      >
                        {item.effectiveReceived ? <UndoOutlined /> : <CheckOutlined />}
                        <span style={{ fontSize: '0.8rem' }}>
                          {item.effectiveReceived ? 'Reabrir' : 'Receber'}
                        </span>
                      </IconActionBtn>

                      <IconActionBtn
                        type='button'
                        onClick={() => handleToggleDisabled(item)}
                        aria-label='Pausar'
                      >
                        <StopOutlined />
                      </IconActionBtn>

                      <IconActionBtn
                        type='button'
                        $color='#D97706'
                        onClick={() => {
                          setAdding(false);
                          setEditingId(item.id);
                        }}
                        aria-label='Editar'
                      >
                        <EditOutlined />
                      </IconActionBtn>

                      <IconActionBtn
                        type='button'
                        $color='#DC2626'
                        onClick={() => confirmDelete(item)}
                        aria-label='Excluir'
                      >
                        <DeleteOutlined />
                      </IconActionBtn>
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
