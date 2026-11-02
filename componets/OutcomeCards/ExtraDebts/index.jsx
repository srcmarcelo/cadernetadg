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
import { Button, Input, InputNumber, Modal, Tag, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { getSelectedMonth } from '../../../containers/Main/redux/reducer';
import {
  createExtraDebt,
  deleteExtraDebt,
  updateExtraDebt,
  updateExtraDebtMonthStatus,
} from '../../../containers/Outcome/redux';
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
  StatusChip,
  TotalBanner,
  getItemStatus,
  sortByStatus,
} from '../../SharedCardStyles';

function ExtraDebtEditor({
  initialName = '',
  initialValue = 0,
  initialCurrentInstallment = 1,
  initialInstallments = 1,
  onSave,
  onCancel,
  saving,
}) {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);
  const [curInst, setCurInst] = useState(initialCurrentInstallment);
  const [totalInst, setTotalInst] = useState(initialInstallments);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning('Digite uma descrição para a despesa.');
      return;
    }
    if (value <= 0) {
      message.warning('Informe o valor da parcela.');
      return;
    }
    onSave({
      name: name.trim(),
      value,
      currentInstallment: curInst || 1,
      installments: Math.max(curInst || 1, totalInst || 1),
    });
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
              placeholder='Ex: IPVA, Empréstimo, Conserto'
            />
          </div>
          <div>
            <FieldLabel>Valor da parcela no mês</FieldLabel>
            <CurrencyInput value={value} onChange={setValue} compact />
          </div>
          <div>
            <FieldLabel>Parcela neste mês</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <InputNumber
                min={1}
                max={240}
                value={curInst}
                onChange={(v) => {
                  const next = v || 1;
                  setCurInst(next);
                  if (next > totalInst) setTotalInst(next);
                }}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>de</span>
              <InputNumber
                min={1}
                max={240}
                value={totalInst}
                onChange={(v) => setTotalInst(Math.max(curInst || 1, v || 1))}
                style={{ width: '100%' }}
              />
            </div>
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
            danger
            htmlType='submit'
            icon={<CheckOutlined />}
            loading={saving}
            onMouseDown={(e) => e.preventDefault()}
          >
            Salvar
          </Button>
        </FormActionsRow>
      </InlineEditorBox>
    </form>
  );
}

export default function ExtraDebts() {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();
  const selectedMonth = useSelector(getSelectedMonth);
  const { resolvedExtraDebts } = useMonthlyFinancialView();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const rawItems = [...resolvedExtraDebts].reverse();
  const items = sortByStatus(rawItems, (it) =>
    getItemStatus(it.effectivePaid, it.effectiveDisabled)
  );
  const pendingTotal = items.reduce(
    (sum, it) =>
      !it.effectivePaid && !it.effectiveDisabled ? sum + it.effectiveValue : sum,
    0
  );

  const handleCreate = async (vals) => {
    setSaving(true);
    try {
      await createExtraDebt({
        dispatch,
        supabase,
        user,
        ...vals,
        selectedMonth,
      });
      setAdding(false);
      message.success(`Despesa "${vals.name}" cadastrada.`);
    } catch {
      message.error('Erro ao salvar despesa.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, vals) => {
    setSaving(true);
    try {
      await updateExtraDebt({
        dispatch,
        supabase,
        user,
        id,
        ...vals,
        selectedMonth,
      });
      setEditingId(null);
      message.success('Despesa atualizada.');
    } catch {
      message.error('Erro ao atualizar despesa.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaid = async (item) => {
    const nextPaid = !item.effectivePaid;
    await updateExtraDebtMonthStatus({
      dispatch,
      supabase,
      user,
      id: item.id,
      selectedMonth,
      monthPatch: { paid: nextPaid },
    });
    if (nextPaid) {
      message.success(
        `Parcela ${item.currentInstallment}/${item.totalInstallments} de "${item.name}" marcada como paga!`
      );
    }
  };

  const handleToggleDisabled = async (item) => {
    await updateExtraDebtMonthStatus({
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
      title: `Excluir "${item.name}"?`,
      icon: <ExclamationCircleOutlined />,
      content:
        'Para marcar apenas a parcela deste mês como paga, use o botão Pagar. Excluir removerá todas as parcelas.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteExtraDebt({ dispatch, supabase, user, id: item.id });
        message.success('Despesa removida.');
      },
    });
  };

  return (
    <SectionCard className='extraDebtsCard'>
      <SectionHeader>
        <SectionTitleGroup>
          <SectionTitle>Outras Despesas e Parcelamentos</SectionTitle>
          <SectionSubtitle>
            Despesas avulsas ou parceladas ativas em {formatMonthYear(selectedMonth)}
          </SectionSubtitle>
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
        <ExtraDebtEditor
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {items.length === 0 && !adding ? (
        <EmptyBox>
          <span>Nenhuma despesa extra ativa em {formatMonthYear(selectedMonth)}.</span>
          <Button
            type='primary'
            danger
            icon={<PlusOutlined />}
            onClick={() => setAdding(true)}
          >
            Adicionar despesa
          </Button>
        </EmptyBox>
      ) : (
        items.length > 0 && (
          <>
            <TotalBanner $variant='danger' className='extraDebtsTotal'>
              <span>Outras despesas pendentes no mês:</span>
              <span>{formatBRL(pendingTotal)}</span>
            </TotalBanner>
            <ItemsList>
              {items.map((item) =>
                editingId === item.id ? (
                  <ExtraDebtEditor
                    key={item.id}
                    initialName={item.name}
                    initialValue={item.effectiveValue}
                    initialCurrentInstallment={item.currentInstallment}
                    initialInstallments={item.totalInstallments}
                    onSave={(vals) => handleUpdate(item.id, vals)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <ListItemCard
                    key={item.id}
                    $status={getItemStatus(item.effectivePaid, item.effectiveDisabled)}
                    $tone='debt'
                  >
                    <ItemInfo>
                      <ItemTitleRow>
                        <ItemName
                          $strike={item.effectivePaid || item.effectiveDisabled}
                        >
                          {item.name}
                        </ItemName>
                        <Tag color='volcano' style={{ margin: 0 }}>
                          Parcela {item.currentInstallment} de {item.totalInstallments}
                        </Tag>
                        {item.effectivePaid && (
                          <StatusChip $status='done' $tone='debt'>
                            PAGO
                          </StatusChip>
                        )}
                        {item.effectiveDisabled && (
                          <StatusChip $status='ignored' $tone='debt'>
                            IGNORADO
                          </StatusChip>
                        )}
                        {!item.effectivePaid && !item.effectiveDisabled && (
                          <StatusChip $status='pending' $tone='debt'>
                            A PAGAR
                          </StatusChip>
                        )}
                      </ItemTitleRow>
                      <ItemAmount
                        $color={
                          item.effectivePaid || item.effectiveDisabled
                            ? '#64748B'
                            : '#DC2626'
                        }
                        $strike={item.effectivePaid || item.effectiveDisabled}
                      >
                        {formatBRL(item.effectiveValue)}
                      </ItemAmount>
                    </ItemInfo>

                    <ItemActions>
                      <IconActionBtn
                        type='button'
                        $bg={item.effectivePaid ? '#F8FAFC' : '#F0FDF4'}
                        $border={item.effectivePaid ? '#CBD5E1' : '#86EFAC'}
                        $color={item.effectivePaid ? '#475569' : '#15803D'}
                        onClick={() => handleTogglePaid(item)}
                        disabled={item.effectiveDisabled}
                        style={{ flex: 1 }}
                      >
                        {item.effectivePaid ? <UndoOutlined /> : <CheckOutlined />}
                        <span style={{ fontSize: '0.8rem' }}>
                          {item.effectivePaid ? 'Reabrir' : 'Pagar'}
                        </span>
                      </IconActionBtn>

                      <IconActionBtn
                        type='button'
                        onClick={() => handleToggleDisabled(item)}
                        aria-label='Ignorar no mês'
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
