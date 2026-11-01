import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CheckOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  StopOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, InputNumber, Modal, Tag, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { getSelectedMonth } from '../../../containers/Main/redux/reducer';
import {
  createCreditCard,
  deleteCreditCard,
  updateCreditCardInfo,
  updateCreditCardMonthInvoice,
} from '../../../containers/Outcome/redux';
import { useMonthlyFinancialView } from '../../../services/useMonthlyFinancialView';
import CurrencyInput from '../../CurrencyInput';
import AiInvoiceImportModal from './AiInvoiceImportModal';
import CreditCardInvoiceModal from './CreditCardInvoiceModal';
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
  ItemsList,
  SectionCard,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  SectionTitleGroup,
  TotalBanner,
} from '../../SharedCardStyles';

const CreditCardTile = styled.div`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: ${({ $muted }) => ($muted ? '#F8FAFC' : '#FFFFFF')};
  border: 1px solid ${({ $muted }) => ($muted ? '#E2E8F0' : '#CBD5E1')};
  opacity: ${({ $muted }) => ($muted ? 0.78 : 1)};
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
`;

const CardTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`;

const CardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const CardNameText = styled.span`
  font-size: 1rem;
  font-weight: 800;
  color: ${({ $strike }) => ($strike ? '#64748B' : '#0F172A')};
  text-decoration: ${({ $strike }) => ($strike ? 'line-through' : 'none')};
  word-break: break-word;
`;

const CardMetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: #64748B;
`;

const CardTotalValue = styled.div`
  font-size: 1.18rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#DC2626'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const CardActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid #F1F5F9;
`;

const PrimaryCardBtn = styled.button`
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 8px;
  border-radius: 10px;
  border: 1px solid #C7D2FE;
  background: #EEF2FF;
  color: #1E295E;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  touch-action: manipulation;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #E0E7FF;
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PayToggleBtn = styled.button`
  height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid ${({ $paid }) => ($paid ? '#CBD5E1' : '#86EFAC')};
  background: ${({ $paid }) => ($paid ? '#F8FAFC' : '#F0FDF4')};
  color: ${({ $paid }) => ($paid ? '#475569' : '#15803D')};
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  white-space: nowrap;
  touch-action: manipulation;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

function CardFormEditor({
  initialName = '',
  initialManualValue = 0,
  initialDueDay = null,
  hasDetailedPurchases = false,
  onSave,
  onCancel,
  saving,
}) {
  const [name, setName] = useState(initialName);
  const [manualValue, setManualValue] = useState(initialManualValue);
  const [dueDay, setDueDay] = useState(initialDueDay);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning('Digite o nome do cartão (ex: Nubank, Itaú).');
      return;
    }
    onSave({
      name: name.trim(),
      manualValue,
      dueDay: dueDay || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <InlineEditorBox>
        <FormRow>
          <div>
            <FieldLabel>Nome do Cartão</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ex: Nubank, Inter, Itaú'
            />
          </div>
          {!hasDetailedPurchases && (
            <div>
              <FieldLabel>Valor da fatura neste mês (opcional)</FieldLabel>
              <CurrencyInput value={manualValue} onChange={setManualValue} compact />
            </div>
          )}
          <div>
            <FieldLabel>Dia do vencimento (opcional)</FieldLabel>
            <InputNumber
              min={1}
              max={31}
              value={dueDay}
              onChange={setDueDay}
              placeholder='Ex: 10'
              style={{ width: '100%' }}
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
            style={{ background: '#1E295E', borderColor: '#1E295E' }}
          >
            Salvar Cartão
          </Button>
        </FormActionsRow>
      </InlineEditorBox>
    </form>
  );
}

export default function CreditCards() {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();
  const selectedMonth = useSelector(getSelectedMonth);
  const { resolvedCreditCards } = useMonthlyFinancialView();

  const [addingCard, setAddingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [detailCardId, setDetailCardId] = useState(null);
  const [aiImportCardId, setAiImportCardId] = useState(undefined); // undefined = closed, null = any card, string = specific card
  const [returnToDetailId, setReturnToDetailId] = useState(null);
  const [saving, setSaving] = useState(false);

  const cards = [...resolvedCreditCards].reverse();
  const pendingTotal = cards.reduce(
    (sum, c) =>
      !c.effectivePaid && !c.effectiveDisabled ? sum + c.effectiveValue : sum,
    0
  );

  const handleCreateCard = async ({ name, manualValue, dueDay }) => {
    setSaving(true);
    try {
      const saved = await createCreditCard({
        dispatch,
        supabase,
        user,
        name,
        manualValue,
        dueDay,
        selectedMonth,
      });
      setAddingCard(false);
      message.success(`Cartão "${name}" adicionado!`);
      if (!manualValue) {
        setDetailCardId(saved.id);
      }
    } catch {
      message.error('Erro ao criar cartão.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCard = async (card, { name, manualValue, dueDay }) => {
    setSaving(true);
    try {
      await updateCreditCardInfo({
        dispatch,
        supabase,
        user,
        id: card.id,
        patch: { name, due_day: dueDay },
      });
      if (!card.hasDetailedPurchases) {
        await updateCreditCardMonthInvoice({
          dispatch,
          supabase,
          user,
          id: card.id,
          selectedMonth,
          monthPatch: { manual_total: manualValue },
        });
      }
      setEditingCardId(null);
      message.success(`Cartão "${name}" atualizado.`);
    } catch {
      message.error('Erro ao atualizar cartão.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePaid = async (card) => {
    const nextPaid = !card.effectivePaid;
    await updateCreditCardMonthInvoice({
      dispatch,
      supabase,
      user,
      id: card.id,
      selectedMonth,
      monthPatch: { paid: nextPaid },
    });
    if (nextPaid) {
      message.success(
        `Fatura do cartão "${card.name}" marcada como paga em ${formatMonthYear(
          selectedMonth
        )}!`
      );
    }
  };

  const handleToggleDisabled = async (card) => {
    await updateCreditCardMonthInvoice({
      dispatch,
      supabase,
      user,
      id: card.id,
      selectedMonth,
      monthPatch: { disabled: !card.effectiveDisabled },
    });
  };

  const confirmDelete = (card) => {
    Modal.confirm({
      title: `Excluir o cartão "${card.name}"?`,
      icon: <ExclamationCircleOutlined />,
      content:
        'Todas as faturas e compras parceladas registradas neste cartão serão excluídas.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteCreditCard({ dispatch, supabase, user, id: card.id });
        message.success(`Cartão "${card.name}" excluído.`);
      },
    });
  };

  const openAiImportForCard = (cardIdOrNull, fromDetailModal = false) => {
    if (fromDetailModal && cardIdOrNull) {
      setReturnToDetailId(cardIdOrNull);
      setDetailCardId(null);
    } else {
      setReturnToDetailId(null);
    }
    setAiImportCardId(cardIdOrNull);
  };

  return (
    <SectionCard>
      <SectionHeader>
        <SectionTitleGroup>
          <SectionTitle>
            <CreditCardOutlined style={{ color: '#1E295E' }} />
            Cartões de Crédito
          </SectionTitle>
          <SectionSubtitle>
            Cadastre parcelas ou envie o PDF/foto da fatura para leitura automática
          </SectionSubtitle>
        </SectionTitleGroup>

        <HeaderActions>
          <Button
            icon={<CloudUploadOutlined />}
            onClick={() => openAiImportForCard(null, false)}
            style={{ borderColor: '#4F46E5', color: '#4F46E5', fontWeight: 700 }}
          >
            Ler Fatura (IA)
          </Button>
          <Button
            type='primary'
            danger
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCardId(null);
              setAddingCard(true);
            }}
            disabled={addingCard}
          >
            Novo Cartão
          </Button>
        </HeaderActions>
      </SectionHeader>

      {addingCard && (
        <CardFormEditor
          onSave={handleCreateCard}
          onCancel={() => setAddingCard(false)}
          saving={saving}
        />
      )}

      {cards.length === 0 && !addingCard ? (
        <EmptyBox>
          <span>Nenhum cartão de crédito cadastrado.</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <Button
              type='primary'
              danger
              icon={<PlusOutlined />}
              onClick={() => setAddingCard(true)}
            >
              Criar cartão
            </Button>
            <Button
              icon={<CloudUploadOutlined />}
              onClick={() => openAiImportForCard(null, false)}
              style={{ borderColor: '#4F46E5', color: '#4F46E5', fontWeight: 700 }}
            >
              Ler fatura PDF/Foto (IA)
            </Button>
          </div>
        </EmptyBox>
      ) : (
        cards.length > 0 && (
          <>
            <TotalBanner $variant='danger'>
              <span>Faturas pendentes no mês:</span>
              <span>{formatBRL(pendingTotal)}</span>
            </TotalBanner>

            <ItemsList>
              {cards.map((card) => {
                if (editingCardId === card.id) {
                  return (
                    <CardFormEditor
                      key={card.id}
                      initialName={card.name}
                      initialManualValue={card.effectiveValue}
                      initialDueDay={card.due_day}
                      hasDetailedPurchases={card.hasDetailedPurchases}
                      onSave={(vals) => handleUpdateCard(card, vals)}
                      onCancel={() => setEditingCardId(null)}
                      saving={saving}
                    />
                  );
                }

                const moreMenuItems = [
                  {
                    key: 'edit',
                    icon: <EditOutlined />,
                    label: 'Editar nome / vencimento',
                    onClick: () => {
                      setAddingCard(false);
                      setEditingCardId(card.id);
                    },
                  },
                  {
                    key: 'disable',
                    icon: <StopOutlined />,
                    label: card.effectiveDisabled
                      ? 'Reativar fatura neste mês'
                      : 'Ignorar fatura neste mês',
                    onClick: () => handleToggleDisabled(card),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    danger: true,
                    label: 'Excluir cartão',
                    onClick: () => confirmDelete(card),
                  },
                ];

                return (
                  <CreditCardTile
                    key={card.id}
                    $muted={card.effectivePaid || card.effectiveDisabled}
                  >
                    <CardTopRow onClick={() => setDetailCardId(card.id)}>
                      <CardTitleBlock>
                        <CardNameRow>
                          <CardNameText
                            $strike={card.effectivePaid || card.effectiveDisabled}
                          >
                            {card.name}
                          </CardNameText>
                          {card.due_day && (
                            <Tag color='blue' style={{ margin: 0 }}>
                              Dia {card.due_day}
                            </Tag>
                          )}
                          {card.effectivePaid && (
                            <Tag color='success' style={{ margin: 0 }}>
                              Paga
                            </Tag>
                          )}
                          {card.effectiveDisabled && (
                            <Tag style={{ margin: 0 }}>Ignorada</Tag>
                          )}
                        </CardNameRow>

                        {(card.purchases.length > 0 || card.installmentsTotal > 0) && (
                          <CardMetaLine>
                            {card.purchases.length > 0 && (
                              <span>
                                {card.purchases.length}{' '}
                                {card.purchases.length === 1 ? 'item' : 'itens'}
                              </span>
                            )}
                            {card.purchases.length > 0 && card.installmentsTotal > 0 && (
                              <span>•</span>
                            )}
                            {card.installmentsTotal > 0 && (
                              <span style={{ color: '#4F46E5', fontWeight: 600 }}>
                                {formatBRL(card.installmentsTotal)} parcelado
                              </span>
                            )}
                          </CardMetaLine>
                        )}
                      </CardTitleBlock>

                      <CardTotalValue
                        $color={
                          card.effectivePaid || card.effectiveDisabled
                            ? '#64748B'
                            : '#DC2626'
                        }
                      >
                        {formatBRL(card.effectiveValue)}
                      </CardTotalValue>
                    </CardTopRow>

                    <CardActionBar>
                      <PrimaryCardBtn
                        type='button'
                        onClick={() => setDetailCardId(card.id)}
                      >
                        <UnorderedListOutlined />
                        <span>Ver Fatura</span>
                      </PrimaryCardBtn>

                      <PayToggleBtn
                        type='button'
                        $paid={card.effectivePaid}
                        onClick={() => handleTogglePaid(card)}
                        disabled={card.effectiveDisabled}
                      >
                        {card.effectivePaid ? <UndoOutlined /> : <CheckOutlined />}
                        <span>{card.effectivePaid ? 'Reabrir' : 'Pagar'}</span>
                      </PayToggleBtn>

                      <IconActionBtn
                        type='button'
                        $color='#4F46E5'
                        $border='#C7D2FE'
                        $bg='#EEF2FF'
                        onClick={() => openAiImportForCard(card.id, false)}
                        aria-label='Importar fatura com IA'
                      >
                        <CloudUploadOutlined />
                        <span style={{ fontSize: '0.78rem' }}>IA</span>
                      </IconActionBtn>

                      <Dropdown
                        menu={{ items: moreMenuItems }}
                        trigger={['click']}
                        placement='bottomRight'
                      >
                        <IconActionBtn
                          type='button'
                          aria-label='Mais opções do cartão'
                        >
                          <MoreOutlined style={{ fontSize: '1.1rem' }} />
                        </IconActionBtn>
                      </Dropdown>
                    </CardActionBar>
                  </CreditCardTile>
                );
              })}
            </ItemsList>
          </>
        )
      )}

      <CreditCardInvoiceModal
        open={Boolean(detailCardId)}
        onClose={() => setDetailCardId(null)}
        cardId={detailCardId}
        selectedMonth={selectedMonth}
        onOpenAiImport={(cId) => openAiImportForCard(cId, true)}
      />

      <AiInvoiceImportModal
        open={aiImportCardId !== undefined}
        onClose={() => {
          setAiImportCardId(undefined);
          if (returnToDetailId) {
            setDetailCardId(returnToDetailId);
            setReturnToDetailId(null);
          }
        }}
        preselectedCardId={aiImportCardId}
        selectedMonth={selectedMonth}
        onImported={(importedCardId) => {
          setReturnToDetailId(null);
          setAiImportCardId(undefined);
          setDetailCardId(importedCardId);
        }}
      />
    </SectionCard>
  );
}
