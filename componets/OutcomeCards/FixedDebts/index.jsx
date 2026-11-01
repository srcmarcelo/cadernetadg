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
  createFixedDebt,
  deleteFixedDebt,
  updateFixedDebt,
  updateFixedDebtMonthStatus,
} from '../../../containers/Outcome/redux';
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

function FixedDebtEditor({ initialName = '', initialValue = 0, onSave, onCancel, saving }) {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning('Digite um nome para identificar a despesa.');
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
              placeholder='Ex: Aluguel, Energia, Internet'
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
            danger
            htmlType='submit'
            icon={<CheckOutlined />}
            loading={saving}
          >
            Salvar
          </Button>
        </div>
      </InlineEditorBox>
    </form>
  );
}

export default function FixedDebts() {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();
  const selectedMonth = useSelector(getSelectedMonth);
  const { resolvedFixedDebts } = useMonthlyFinancialView();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const items = [...resolvedFixedDebts].reverse();
  const pendingTotal = items.reduce(
    (sum, it) =>
      !it.effectivePaid && !it.effectiveDisabled ? sum + it.effectiveValue : sum,
    0
  );

  const handleCreate = async ({ name, value }) => {
    setSaving(true);
    try {
      await createFixedDebt({ dispatch, supabase, user, name, value });
      setAdding(false);
      message.success(`Despesa fixa "${name}" adicionada.`);
    } catch {
      message.error('Erro ao salvar despesa fixa.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, { name, value }) => {
    setSaving(true);
    try {
      await updateFixedDebt({
        dispatch,
        supabase,
        user,
        id,
        patch: { name, value },
      });
      setEditingId(null);
      message.success(`Despesa "${name}" atualizada.`);
    } catch {
      message.error('Erro ao atualizar despesa.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaid = async (item) => {
    const nextPaid = !item.effectivePaid;
    await updateFixedDebtMonthStatus({
      dispatch,
      supabase,
      user,
      id: item.id,
      selectedMonth,
      monthPatch: { paid: nextPaid },
    });
    if (nextPaid) {
      message.success(`"${item.name}" marcada como paga em ${formatMonthYear(selectedMonth)}.`);
    }
  };

  const handleToggleDisabled = async (item) => {
    await updateFixedDebtMonthStatus({
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
        'Para ignorar apenas neste mês, use o botão de pausar. Excluir removerá a despesa fixa permanentemente.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteFixedDebt({ dispatch, supabase, user, id: item.id });
        message.success('Despesa fixa removida.');
      },
    });
  };

  return (
    <SectionCard className='fixedDebtsCard'>
      <SectionHeader>
        <SectionTitleGroup>
          <SectionTitle>Despesas Fixas</SectionTitle>
          <SectionSubtitle>Contas recorrentes todos os meses</SectionSubtitle>
        </SectionTitleGroup>
        <HeaderActions>
          <Button
            type='primary'
            danger
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
            disabled={adding}
          >
            Adicionar
          </Button>
        </HeaderActions>
      </SectionHeader>

      {adding && (
        <FixedDebtEditor
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {items.length === 0 && !adding ? (
        <EmptyBox>
          <span>Nenhuma despesa fixa cadastrada (ex: Aluguel, Água, Luz).</span>
          <Button
            type='primary'
            danger
            icon={<PlusOutlined />}
            onClick={() => setAdding(true)}
          >
            Cadastrar despesa fixa
          </Button>
        </EmptyBox>
      ) : (
        items.length > 0 && (
          <>
            <TotalBanner $variant='danger' className='fixedDebtsTotal'>
              <span>Despesas fixas pendentes no mês:</span>
              <span>{formatBRL(pendingTotal)}</span>
            </TotalBanner>
            <ItemsList>
              {items.map((item) =>
                editingId === item.id ? (
                  <FixedDebtEditor
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
                    $muted={item.effectivePaid || item.effectiveDisabled}
                  >
                    <ItemInfo>
                      <ItemTitleRow>
                        <ItemName
                          $strike={item.effectivePaid || item.effectiveDisabled}
                        >
                          {item.name}
                        </ItemName>
                        {item.effectivePaid && <Tag color='success'>Pago</Tag>}
                        {item.effectiveDisabled && <Tag>Ignorado no mês</Tag>}
                      </ItemTitleRow>
                      <ItemAmount
                        $color={
                          item.effectivePaid || item.effectiveDisabled
                            ? '#64748B'
                            : '#DC2626'
                        }
                      >
                        {formatBRL(item.effectiveValue)}
                      </ItemAmount>
                    </ItemInfo>

                    <ItemActions>
                      <Tooltip
                        title={
                          item.effectivePaid
                            ? 'Desmarcar pagamento neste mês'
                            : 'Marcar como paga neste mês'
                        }
                      >
                        <IconActionBtn
                          type='button'
                          $bg='#F0FDF4'
                          $border='#86EFAC'
                          $color='#15803D'
                          onClick={() => handleTogglePaid(item)}
                          disabled={item.effectiveDisabled}
                        >
                          {item.effectivePaid ? <UndoOutlined /> : <CheckOutlined />}
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
