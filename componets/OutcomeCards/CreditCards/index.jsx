import React, { useState } from 'react';
import {
  CheckOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  StopOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Input, InputNumber, Modal, Tag, Tooltip, message } from 'antd';
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
              autoFocus
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
            style={{ background: '#1E295E', borderColor: '#1E295E' }}
          >
            Salvar Cartão
          </Button>
        </div>
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

  return (
    <SectionCard>
      <SectionHeader>
        <SectionTitleGroup>
          <SectionTitle>
            <CreditCardOutlined style={{ color: '#1E295E' }} />
            Cartões de Crédito
          </SectionTitle>
          <SectionSubtitle>
            Detalhe compras parceladas ou anexe a fatura para leitura automática com IA
          </SectionSubtitle>
        </SectionTitleGroup>

        <HeaderActions>
          <Button
            icon={<CloudUploadOutlined />}
            onClick={() => setAiImportCardId(null)}
            style={{ borderColor: '#4F46E5', color: '#4F46E5', fontWeight: 600 }}
          >
            Anexar Fatura (IA)
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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              type='primary'
              danger
              icon={<PlusOutlined />}
              onClick={() => setAddingCard(true)}
            >
              Criar cartão manualmente
            </Button>
            <Button
              icon={<CloudUploadOutlined />}
              onClick={() => setAiImportCardId(null)}
              style={{ borderColor: '#4F46E5', color: '#4F46E5', fontWeight: 600 }}
            >
              Anexar fatura PDF/Foto (IA)
            </Button>
          </div>
        </EmptyBox>
      ) : (
        cards.length > 0 && (
          <>
            <TotalBanner $variant='danger'>
              <span>Total de faturas pendentes no mês:</span>
              <span>{formatBRL(pendingTotal)}</span>
            </TotalBanner>

            <ItemsList>
              {cards.map((card) =>
                editingCardId === card.id ? (
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
                ) : (
                  <ListItemCard
                    key={card.id}
                    $muted={card.effectivePaid || card.effectiveDisabled}
                  >
                    <ItemInfo>
                      <ItemTitleRow>
                        <ItemName
                          $strike={card.effectivePaid || card.effectiveDisabled}
                        >
                          {card.name}
                        </ItemName>
                        {card.due_day && (
                          <Tag color='blue'>Vence dia {card.due_day}</Tag>
                        )}
                        {card.purchases.length > 0 && (
                          <Tag color='purple'>
                            {card.purchases.length}{' '}
                            {card.purchases.length === 1 ? 'item' : 'itens'}
                          </Tag>
                        )}
                        {card.installmentsTotal > 0 && (
                          <Tag color='geekblue'>
                            {formatBRL(card.installmentsTotal)} parcelado
                          </Tag>
                        )}
                        {card.effectivePaid && <Tag color='success'>Fatura Paga</Tag>}
                        {card.effectiveDisabled && <Tag>Ignorado no mês</Tag>}
                      </ItemTitleRow>

                      <ItemAmount
                        $color={
                          card.effectivePaid || card.effectiveDisabled
                            ? '#64748B'
                            : '#DC2626'
                        }
                      >
                        {formatBRL(card.effectiveValue)}
                      </ItemAmount>
                    </ItemInfo>

                    <ItemActions>
                      <Button
                        size='small'
                        type='primary'
                        ghost
                        icon={<UnorderedListOutlined />}
                        onClick={() => setDetailCardId(card.id)}
                      >
                        Fatura
                      </Button>

                      <Tooltip title='Anexar fatura PDF/Imagem neste cartão'>
                        <IconActionBtn
                          type='button'
                          $color='#4F46E5'
                          $border='#C7D2FE'
                          $bg='#EEF2FF'
                          onClick={() => setAiImportCardId(card.id)}
                        >
                          <CloudUploadOutlined />
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip
                        title={
                          card.effectivePaid
                            ? 'Reabrir fatura neste mês'
                            : 'Confirmar pagamento da fatura neste mês'
                        }
                      >
                        <IconActionBtn
                          type='button'
                          $bg='#F0FDF4'
                          $border='#86EFAC'
                          $color='#15803D'
                          onClick={() => handleTogglePaid(card)}
                          disabled={card.effectiveDisabled}
                        >
                          {card.effectivePaid ? <UndoOutlined /> : <CheckOutlined />}
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip
                        title={
                          card.effectiveDisabled
                            ? 'Reativar neste mês'
                            : 'Ignorar neste mês'
                        }
                      >
                        <IconActionBtn
                          type='button'
                          onClick={() => handleToggleDisabled(card)}
                        >
                          <StopOutlined />
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip title='Editar cartão'>
                        <IconActionBtn
                          type='button'
                          $color='#D97706'
                          onClick={() => {
                            setAddingCard(false);
                            setEditingCardId(card.id);
                          }}
                        >
                          <EditOutlined />
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip title='Excluir cartão'>
                        <IconActionBtn
                          type='button'
                          $color='#DC2626'
                          onClick={() => confirmDelete(card)}
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

      <CreditCardInvoiceModal
        open={Boolean(detailCardId)}
        onClose={() => setDetailCardId(null)}
        cardId={detailCardId}
        selectedMonth={selectedMonth}
        onOpenAiImport={(cId) => setAiImportCardId(cId)}
      />

      <AiInvoiceImportModal
        open={aiImportCardId !== undefined}
        onClose={() => setAiImportCardId(undefined)}
        preselectedCardId={aiImportCardId}
        selectedMonth={selectedMonth}
        onImported={(importedCardId) => {
          setDetailCardId(importedCardId);
        }}
      />
    </SectionCard>
  );
}
