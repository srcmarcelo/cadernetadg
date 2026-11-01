import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
  UndoOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, InputNumber, Modal, Tag, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { getSelectedMonth, getUserInfo } from '../../../containers/Main/redux/reducer';
import { getDebtors } from '../../../containers/Income/redux/reducer';
import {
  createDebtor,
  createDebtorDebt,
  deleteDebtorAndDebts,
  deleteDebtorDebt,
  updateDebtor,
  updateDebtorDebt,
  updateDebtorDebtMonthStatus,
} from '../../../containers/Income/redux';
import { useMonthlyFinancialView } from '../../../services/useMonthlyFinancialView';
import CurrencyInput from '../../CurrencyInput';
import DebtorExportModal from './DebtorExportModal';
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

const DebtorBox = styled.div`
  width: 100%;
  border-radius: 14px;
  border: 1px solid #CBD5E1;
  background: #F8FAFC;
  overflow: hidden;
`;

const DebtorTopBar = styled.div`
  padding: 12px;
  background: #EEF2FF;
  border-bottom: 1px solid #E0E7FF;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 560px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const DebtorHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;

const DebtorName = styled.span`
  font-size: 1rem;
  font-weight: 800;
  color: #1E295E;
  word-break: break-word;
`;

const DebtorActionsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;

  @media (min-width: 560px) {
    width: auto;
  }
`;

const DebtorBody = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 560px) {
    padding: 12px;
  }
`;

function DebtorNameEditor({ initialName = '', initialPhone = '', onSave, onCancel, saving }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning('Digite o nome da pessoa.');
      return;
    }
    onSave({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <InlineEditorBox>
        <FormRow>
          <div>
            <FieldLabel>Nome do devedor</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ex: Cunhado, João, Irmã'
            />
          </div>
          <div>
            <FieldLabel>WhatsApp (opcional)</FieldLabel>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Ex: (11) 99999-9999'
            />
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
          >
            Salvar
          </Button>
        </FormActionsRow>
      </InlineEditorBox>
    </form>
  );
}

function DebtorDebtEditor({
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
      message.warning('Digite uma descrição para o débito.');
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
              placeholder='Ex: Compra no cartão, Empréstimo'
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
                max={120}
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
                max={120}
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
            htmlType='submit'
            icon={<CheckOutlined />}
            loading={saving}
            onMouseDown={(e) => e.preventDefault()}
            style={{ background: '#16A34A', borderColor: '#16A34A' }}
          >
            Salvar Débito
          </Button>
        </FormActionsRow>
      </InlineEditorBox>
    </form>
  );
}

export default function Debtors() {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();
  const userInfo = useSelector(getUserInfo);
  const selectedMonth = useSelector(getSelectedMonth);
  const debtors = useSelector(getDebtors);
  const { resolvedDebtorDebts } = useMonthlyFinancialView();

  const [addingDebtor, setAddingDebtor] = useState(false);
  const [editingDebtorId, setEditingDebtorId] = useState(null);
  const [addingDebtForDebtor, setAddingDebtForDebtor] = useState(null);
  const [editingDebtId, setEditingDebtId] = useState(null);
  const [exportingDebtor, setExportingDebtor] = useState(null);
  const [saving, setSaving] = useState(false);

  const reversedDebtors = [...debtors].reverse();

  const totalPendingAllDebtors = resolvedDebtorDebts.reduce(
    (sum, d) => (!d.effectivePaid && !d.effectiveDisabled ? sum + d.effectiveValue : sum),
    0
  );

  const handleCreateDebtor = async ({ name, phone }) => {
    setSaving(true);
    try {
      const created = await createDebtor({ dispatch, supabase, user, name, phone });
      setAddingDebtor(false);
      setAddingDebtForDebtor(created.id);
      message.success(`Devedor "${name}" cadastrado.`);
    } catch {
      message.error('Erro ao criar devedor.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDebtor = async (id, { name, phone }) => {
    setSaving(true);
    try {
      await updateDebtor({
        dispatch,
        supabase,
        user,
        id,
        patch: { name, ...(phone !== undefined ? { phone } : {}) },
      });
      setEditingDebtorId(null);
      message.success(`Devedor "${name}" atualizado.`);
    } catch {
      message.error('Erro ao atualizar devedor.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteDebtor = (debtor) => {
    Modal.confirm({
      title: `Excluir o devedor "${debtor.name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Todos os débitos vinculados a esta pessoa também serão excluídos.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteDebtorAndDebts({ dispatch, supabase, user, debtorId: debtor.id });
        message.success(`Devedor "${debtor.name}" removido.`);
      },
    });
  };

  const handleCreateDebt = async (debtorId, vals) => {
    setSaving(true);
    try {
      await createDebtorDebt({
        dispatch,
        supabase,
        user,
        debtorId,
        ...vals,
        selectedMonth,
      });
      setAddingDebtForDebtor(null);
      message.success('Débito adicionado com sucesso.');
    } catch {
      message.error('Erro ao salvar débito.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDebt = async (id, vals) => {
    setSaving(true);
    try {
      await updateDebtorDebt({
        dispatch,
        supabase,
        user,
        id,
        ...vals,
        selectedMonth,
      });
      setEditingDebtId(null);
      message.success('Débito atualizado.');
    } catch {
      message.error('Erro ao atualizar débito.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDebtPaid = async (debt) => {
    const nextPaid = !debt.effectivePaid;
    await updateDebtorDebtMonthStatus({
      dispatch,
      supabase,
      user,
      id: debt.id,
      selectedMonth,
      monthPatch: { paid: nextPaid },
    });
    if (nextPaid) {
      message.success(
        `Parcela ${debt.currentInstallment}/${debt.totalInstallments} de "${debt.name}" marcada como recebida!`
      );
    }
  };

  const handleToggleDebtDisabled = async (debt) => {
    await updateDebtorDebtMonthStatus({
      dispatch,
      supabase,
      user,
      id: debt.id,
      selectedMonth,
      monthPatch: { disabled: !debt.effectiveDisabled },
    });
  };

  const confirmDeleteDebt = (debt) => {
    Modal.confirm({
      title: `Excluir o débito "${debt.name}"?`,
      icon: <ExclamationCircleOutlined />,
      content:
        'Para marcar apenas a parcela deste mês como paga, toque em Receber. Excluir removerá o débito de todos os meses.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteDebtorDebt({ dispatch, supabase, user, id: debt.id });
        message.success('Débito excluído.');
      },
    });
  };

  return (
    <SectionCard>
      <SectionHeader>
        <SectionTitleGroup>
          <SectionTitle>Devedores</SectionTitle>
          <SectionSubtitle>
            Pessoas que te devem em {formatMonthYear(selectedMonth)}
          </SectionSubtitle>
        </SectionTitleGroup>
        <HeaderActions>
          <Button
            type='primary'
            icon={<UserAddOutlined />}
            onClick={() => {
              setEditingDebtorId(null);
              setAddingDebtor(true);
            }}
            disabled={addingDebtor}
            style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
          >
            Novo Devedor
          </Button>
        </HeaderActions>
      </SectionHeader>

      {addingDebtor && (
        <DebtorNameEditor
          onSave={handleCreateDebtor}
          onCancel={() => setAddingDebtor(false)}
          saving={saving}
        />
      )}

      {reversedDebtors.length === 0 && !addingDebtor ? (
        <EmptyBox>
          <span>Nenhuma pessoa cadastrada como devedora ainda.</span>
          <Button
            type='primary'
            icon={<UserAddOutlined />}
            onClick={() => setAddingDebtor(true)}
            style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
          >
            Cadastrar devedor
          </Button>
        </EmptyBox>
      ) : (
        reversedDebtors.length > 0 && (
          <>
            <TotalBanner>
              <span>A receber de devedores:</span>
              <span>{formatBRL(totalPendingAllDebtors)}</span>
            </TotalBanner>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reversedDebtors.map((debtor) => {
                const debtorMonthDebts = resolvedDebtorDebts
                  .filter((d) => d.debtor_id === debtor.id)
                  .reverse();

                const debtorPendingSum = debtorMonthDebts.reduce(
                  (sum, d) =>
                    !d.effectivePaid && !d.effectiveDisabled
                      ? sum + d.effectiveValue
                      : sum,
                  0
                );

                const debtorMenu = [
                  {
                    key: 'edit',
                    icon: <EditOutlined />,
                    label: 'Editar nome / WhatsApp',
                    onClick: () => setEditingDebtorId(debtor.id),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    danger: true,
                    label: 'Excluir devedor',
                    onClick: () => confirmDeleteDebtor(debtor),
                  },
                ];

                return (
                  <DebtorBox key={debtor.id}>
                    <DebtorTopBar>
                      {editingDebtorId === debtor.id ? (
                        <DebtorNameEditor
                          initialName={debtor.name}
                          initialPhone={debtor.phone || ''}
                          onSave={(vals) => handleUpdateDebtor(debtor.id, vals)}
                          onCancel={() => setEditingDebtorId(null)}
                          saving={saving}
                        />
                      ) : (
                        <>
                          <DebtorHeaderRow>
                            <DebtorName>{debtor.name}</DebtorName>
                            <Tag color='green' style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>
                              {formatBRL(debtorPendingSum)}
                            </Tag>
                          </DebtorHeaderRow>

                          <DebtorActionsBar>
                            <Button
                              type='primary'
                              ghost
                              icon={<ExportOutlined />}
                              onClick={() => setExportingDebtor(debtor)}
                              style={{ flex: 1, minHeight: 38, fontWeight: 600 }}
                            >
                              Exportar
                            </Button>

                            <Button
                              type='primary'
                              icon={<PlusOutlined />}
                              onClick={() => setAddingDebtForDebtor(debtor.id)}
                              style={{
                                flex: 1,
                                minHeight: 38,
                                fontWeight: 600,
                                background: '#4F46E5',
                                borderColor: '#4F46E5',
                              }}
                            >
                              Débito
                            </Button>

                            <Dropdown
                              menu={{ items: debtorMenu }}
                              trigger={['click']}
                              placement='bottomRight'
                            >
                              <IconActionBtn
                                type='button'
                                $bg='#FFFFFF'
                                aria-label='Opções do devedor'
                              >
                                <MoreOutlined style={{ fontSize: '1.1rem' }} />
                              </IconActionBtn>
                            </Dropdown>
                          </DebtorActionsBar>
                        </>
                      )}
                    </DebtorTopBar>

                    <DebtorBody>
                      {addingDebtForDebtor === debtor.id && (
                        <DebtorDebtEditor
                          onSave={(vals) => handleCreateDebt(debtor.id, vals)}
                          onCancel={() => setAddingDebtForDebtor(null)}
                          saving={saving}
                        />
                      )}

                      {debtorMonthDebts.length === 0 && addingDebtForDebtor !== debtor.id ? (
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '10px',
                            color: '#64748B',
                            fontSize: '0.85rem',
                          }}
                        >
                          Nenhum débito ativo para {debtor.name} em{' '}
                          {formatMonthYear(selectedMonth)}.
                        </div>
                      ) : (
                        <ItemsList>
                          {debtorMonthDebts.map((debt) =>
                            editingDebtId === debt.id ? (
                              <DebtorDebtEditor
                                key={debt.id}
                                initialName={debt.name}
                                initialValue={debt.effectiveValue}
                                initialCurrentInstallment={debt.currentInstallment}
                                initialInstallments={debt.totalInstallments}
                                onSave={(vals) => handleUpdateDebt(debt.id, vals)}
                                onCancel={() => setEditingDebtId(null)}
                                saving={saving}
                              />
                            ) : (
                              <ListItemCard
                                key={debt.id}
                                $muted={debt.effectivePaid || debt.effectiveDisabled}
                              >
                                <ItemInfo>
                                  <ItemTitleRow>
                                    <ItemName
                                      $strike={
                                        debt.effectivePaid || debt.effectiveDisabled
                                      }
                                    >
                                      {debt.name}
                                    </ItemName>
                                    <Tag color='geekblue' style={{ margin: 0 }}>
                                      {debt.currentInstallment}/{debt.totalInstallments}
                                    </Tag>
                                    {debt.effectivePaid && (
                                      <Tag color='success' style={{ margin: 0 }}>
                                        Pago
                                      </Tag>
                                    )}
                                    {debt.effectiveDisabled && (
                                      <Tag style={{ margin: 0 }}>Pausado</Tag>
                                    )}
                                  </ItemTitleRow>
                                  <ItemAmount
                                    $color={
                                      debt.effectivePaid || debt.effectiveDisabled
                                        ? '#64748B'
                                        : '#16A34A'
                                    }
                                  >
                                    {formatBRL(debt.effectiveValue)}
                                  </ItemAmount>
                                </ItemInfo>

                                <ItemActions>
                                  <IconActionBtn
                                    type='button'
                                    $bg={debt.effectivePaid ? '#F8FAFC' : '#F0FDF4'}
                                    $border={debt.effectivePaid ? '#CBD5E1' : '#86EFAC'}
                                    $color={debt.effectivePaid ? '#475569' : '#15803D'}
                                    onClick={() => handleToggleDebtPaid(debt)}
                                    disabled={debt.effectiveDisabled}
                                    style={{ flex: 1 }}
                                  >
                                    {debt.effectivePaid ? (
                                      <UndoOutlined />
                                    ) : (
                                      <CheckOutlined />
                                    )}
                                    <span style={{ fontSize: '0.8rem' }}>
                                      {debt.effectivePaid ? 'Reabrir' : 'Receber'}
                                    </span>
                                  </IconActionBtn>

                                  <IconActionBtn
                                    type='button'
                                    onClick={() => handleToggleDebtDisabled(debt)}
                                    aria-label='Pausar neste mês'
                                  >
                                    <StopOutlined />
                                  </IconActionBtn>

                                  <IconActionBtn
                                    type='button'
                                    $color='#D97706'
                                    onClick={() => setEditingDebtId(debt.id)}
                                    aria-label='Editar débito'
                                  >
                                    <EditOutlined />
                                  </IconActionBtn>

                                  <IconActionBtn
                                    type='button'
                                    $color='#DC2626'
                                    onClick={() => confirmDeleteDebt(debt)}
                                    aria-label='Excluir débito'
                                  >
                                    <DeleteOutlined />
                                  </IconActionBtn>
                                </ItemActions>
                              </ListItemCard>
                            )
                          )}
                        </ItemsList>
                      )}
                    </DebtorBody>
                  </DebtorBox>
                );
              })}
            </div>
          </>
        )
      )}

      <DebtorExportModal
        open={Boolean(exportingDebtor)}
        onClose={() => setExportingDebtor(null)}
        debtor={exportingDebtor}
        resolvedDebts={resolvedDebtorDebts}
        selectedMonth={selectedMonth}
        creditorName={userInfo?.name || user?.user_metadata?.user_name || ''}
      />
    </SectionCard>
  );
}
