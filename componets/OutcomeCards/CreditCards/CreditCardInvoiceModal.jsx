import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CheckOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  SettingOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Tag,
  message,
} from 'antd';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useSupabaseClient, useUser } from '../../../services/supabaseClient';
import {
  getHasCardPurchasesTable,
  setSelectedMonth,
} from '../../../containers/Main/redux/reducer';
import {
  getCardPurchases,
  getCreditCards,
} from '../../../containers/Outcome/redux/reducer';
import {
  createCardPurchase,
  deleteCardPurchase,
  toggleCardPurchaseMonthDisabled,
  updateCardPurchase,
  updateCreditCardMonthInvoice,
} from '../../../containers/Outcome/redux';
import {
  getCardFutureProjection,
  resolveCreditCardForMonth,
} from '../../../utils/creditCardUtils';
import { formatBRL, roundMoney } from '../../../utils/currency';
import {
  addMonths,
  formatMonthYear,
  getCurrentYearMonth,
} from '../../../utils/monthUtils';
import CurrencyInput from '../../CurrencyInput';
import {
  EmptyBox,
  FieldLabel,
  FormActionsRow,
  FormRow,
  IconActionBtn,
  InlineEditorBox,
  ItemActions,
  ItemAmount,
  ItemInfo,
  ItemName,
  ItemsList,
  ItemTitleRow,
  ListItemCard,
} from '../../SharedCardStyles';

const ModalMonthBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  background: #F1F5F9;
  border-radius: 11px;
`;

const ProjectionStrip = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
`;

const ProjectionPill = styled.button`
  flex: 0 0 98px;
  scroll-snap-align: start;
  padding: 8px 6px;
  border-radius: 10px;
  border: 1.5px solid ${({ $active }) => ($active ? '#1E295E' : '#E2E8F0')};
  background: ${({ $active }) => ($active ? '#EEF2FF' : '#F8FAFC')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  touch-action: manipulation;

  @media (min-width: 640px) {
    flex: 1 1 0;
    min-width: 90px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (min-width: 580px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ $highlight }) => ($highlight ? '#FEF2F2' : '#F8FAFC')};
  border: 1px solid ${({ $highlight }) => ($highlight ? '#FECACA' : '#E2E8F0')};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ActionButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  & > .ant-btn {
    min-height: 40px;
    font-weight: 600;
  }

  @media (min-width: 560px) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
`;

const CATEGORIES = [
  'Compras',
  'Supermercado',
  'Alimentação',
  'Transporte',
  'Assinatura',
  'Saúde',
  'Lazer',
  'Serviços',
  'Encargos',
  'Estorno',
  'Outros',
];

function PurchaseFormEditor({
  initialItem = null,
  onSave,
  onCancel,
  saving,
}) {
  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState(initialItem?.category || 'Compras');
  const [purchaseDate, setPurchaseDate] = useState(initialItem?.purchase_date || '');
  const [isRecurring, setIsRecurring] = useState(Boolean(initialItem?.isRecurring));
  const [curInst, setCurInst] = useState(initialItem?.currentInstallment || 1);
  const [totalInst, setTotalInst] = useState(initialItem?.totalInstallments || 1);
  const [amountMode, setAmountMode] = useState('installment'); // 'installment' | 'total'
  const [inputAmount, setInputAmount] = useState(initialItem?.effectiveValue || 0);

  const computedMonthlyValue = useMemo(() => {
    if (isRecurring || amountMode === 'installment') return roundMoney(inputAmount);
    const divisor = Math.max(1, totalInst || 1);
    return roundMoney(inputAmount / divisor);
  }, [inputAmount, amountMode, totalInst, isRecurring]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      message.warning('Informe a descrição da compra.');
      return;
    }
    if (computedMonthlyValue === 0) {
      message.warning('Informe o valor da compra.');
      return;
    }
    onSave({
      name: name.trim(),
      category,
      purchaseDate: purchaseDate.trim(),
      value: computedMonthlyValue,
      currentInstallment: isRecurring ? 1 : curInst || 1,
      installments: isRecurring ? 1 : Math.max(curInst || 1, totalInst || 1),
      isRecurring,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <InlineEditorBox>
        <FormRow>
          <div>
            <FieldLabel>Estabelecimento / Compra</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Ex: Amazon, Supermercado'
            />
          </div>
          <div>
            <FieldLabel>Categoria</FieldLabel>
            <Select
              style={{ width: '100%' }}
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div>
            <FieldLabel>Data (opcional)</FieldLabel>
            <Input
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              placeholder='Ex: 15/10'
            />
          </div>
        </FormRow>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Checkbox
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          >
            Assinatura mensal recorrente (ex: Netflix, Spotify)
          </Checkbox>

          {!isRecurring && totalInst > 1 && (
            <Radio.Group
              size='small'
              value={amountMode}
              onChange={(e) => setAmountMode(e.target.value)}
            >
              <Radio.Button value='installment'>Parcela</Radio.Button>
              <Radio.Button value='total'>Total da compra</Radio.Button>
            </Radio.Group>
          )}
        </div>

        <FormRow>
          <div>
            <FieldLabel>
              {isRecurring
                ? 'Valor mensal'
                : amountMode === 'total' && totalInst > 1
                ? `Valor total (${totalInst}x de ${formatBRL(computedMonthlyValue)})`
                : 'Valor da parcela nesta fatura'}
            </FieldLabel>
            <CurrencyInput
              allowNegative
              value={inputAmount}
              onChange={setInputAmount}
              compact
            />
          </div>

          {!isRecurring && (
            <div>
              <FieldLabel>Parcela atual / Total de parcelas</FieldLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <InputNumber
                  min={1}
                  max={72}
                  value={curInst}
                  onChange={(v) => {
                    const next = v || 1;
                    setCurInst(next);
                    if (next > totalInst) setTotalInst(next);
                  }}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>de</span>
                <InputNumber
                  min={1}
                  max={72}
                  value={totalInst}
                  onChange={(v) => setTotalInst(Math.max(curInst || 1, v || 1))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
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
            Salvar Compra
          </Button>
        </FormActionsRow>
      </InlineEditorBox>
    </form>
  );
}

export default function CreditCardInvoiceModal({
  open,
  onClose,
  cardId,
  selectedMonth,
  onOpenAiImport,
}) {
  const dispatch = useDispatch();
  const reduxStore = useStore();
  const supabase = useSupabaseClient();
  const user = useUser();
  const creditCards = useSelector(getCreditCards);
  const cardPurchases = useSelector(getCardPurchases);
  const hasCardPurchasesTable = useSelector(getHasCardPurchasesTable);

  const [addingPurchase, setAddingPurchase] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [editingManualTotal, setEditingManualTotal] = useState(false);
  const [manualValueInput, setManualValueInput] = useState(0);
  const [saving, setSaving] = useState(false);

  const card = useMemo(
    () => creditCards.find((c) => c.id === cardId) || null,
    [creditCards, cardId]
  );

  const baseMonth = getCurrentYearMonth();

  const resolvedCard = useMemo(() => {
    if (!card) return null;
    return resolveCreditCardForMonth(card, cardPurchases, selectedMonth, baseMonth);
  }, [card, cardPurchases, selectedMonth, baseMonth]);

  const projection = useMemo(() => {
    if (!card) return [];
    return getCardFutureProjection(card, cardPurchases, baseMonth, 6, baseMonth);
  }, [card, cardPurchases, baseMonth]);

  if (!card || !resolvedCard) return null;

  const purchasesList = [...resolvedCard.purchases].reverse();

  const handleAddPurchase = async (vals) => {
    setSaving(true);
    try {
      await createCardPurchase({
        dispatch,
        getState: reduxStore.getState,
        supabase,
        user,
        cardId: card.id,
        ...vals,
        selectedMonth,
      });
      setAddingPurchase(false);
      message.success('Compra registrada na fatura!');
    } catch {
      message.error('Erro ao registrar compra.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePurchase = async (id, vals) => {
    setSaving(true);
    try {
      await updateCardPurchase({
        dispatch,
        getState: reduxStore.getState,
        supabase,
        user,
        id,
        ...vals,
        selectedMonth,
      });
      setEditingPurchaseId(null);
      message.success('Compra atualizada.');
    } catch {
      message.error('Erro ao atualizar compra.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePurchaseDisabled = async (purchase) => {
    await toggleCardPurchaseMonthDisabled({
      dispatch,
      getState: reduxStore.getState,
      supabase,
      user,
      id: purchase.id,
      selectedMonth,
      disabled: !purchase.effectiveDisabled,
    });
  };

  const handleDeletePurchase = (purchase) => {
    Modal.confirm({
      title: `Excluir "${purchase.name}"?`,
      content:
        purchase.totalInstallments > 1
          ? 'Isso removerá esta compra parcelada de todos os meses da fatura.'
          : 'Isso removerá este lançamento da fatura.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteCardPurchase({
          dispatch,
          getState: reduxStore.getState,
          supabase,
          user,
          id: purchase.id,
        });
        message.success('Compra removida.');
      },
    });
  };

  const handleSaveManualOverride = async () => {
    setSaving(true);
    try {
      await updateCreditCardMonthInvoice({
        dispatch,
        supabase,
        user,
        id: card.id,
        selectedMonth,
        monthPatch: {
          manual_total: roundMoney(manualValueInput),
          override_total: !resolvedCard.hasDetailedPurchases,
          manual_adjustment: resolvedCard.hasDetailedPurchases
            ? roundMoney(manualValueInput - resolvedCard.purchasesTotal)
            : 0,
        },
      });
      setEditingManualTotal(false);
      message.success('Valor da fatura ajustado para este mês.');
    } catch {
      message.error('Erro ao ajustar fatura.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={740}
      title={
        <span style={{ paddingRight: 24, display: 'inline-block' }}>
          Fatura • <strong>{card.name}</strong>
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Dedicated non-overlapping Month Switcher Bar */}
        <ModalMonthBar>
          <Button
            icon={<LeftOutlined />}
            onClick={() => dispatch(setSelectedMonth(addMonths(selectedMonth, -1)))}
            aria-label='Mês anterior'
          />
          <strong style={{ fontSize: '0.95rem', color: '#1E295E', textAlign: 'center' }}>
            {formatMonthYear(selectedMonth)}
          </strong>
          <Button
            icon={<RightOutlined />}
            onClick={() => dispatch(setSelectedMonth(addMonths(selectedMonth, 1)))}
            aria-label='Próximo mês'
          />
        </ModalMonthBar>

        {!hasCardPurchasesTable && (
          <Alert
            type='warning'
            showIcon
            title='Execute a migração SQL no Supabase para sincronizar o detalhamento das compras entre dispositivos.'
          />
        )}

        {/* 6-month swipeable projection strip */}
        <div>
          <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
            PROJEÇÃO DAS PRÓXIMAS FATURAS (TOQUE PARA NAVEGAR)
          </div>
          <ProjectionStrip>
            {projection.map((p) => (
              <ProjectionPill
                key={p.month}
                type='button'
                $active={p.month === selectedMonth}
                onClick={() => dispatch(setSelectedMonth(p.month))}
              >
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                  {p.label}
                </span>
                <strong style={{ fontSize: '0.84rem', color: p.total > 0 ? '#DC2626' : '#16A34A' }}>
                  {formatBRL(p.total)}
                </strong>
              </ProjectionPill>
            ))}
          </ProjectionStrip>
        </div>

        {/* Summary breakdown (2x2 on mobile, 4x1 on desktop) */}
        <SummaryGrid>
          <StatBox $highlight>
            <span style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: 600 }}>
              Total da Fatura
            </span>
            <strong style={{ fontSize: '1.1rem', color: '#DC2626' }}>
              {formatBRL(resolvedCard.effectiveValue)}
            </strong>
          </StatBox>
          <StatBox>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>À vista</span>
            <strong style={{ fontSize: '0.96rem', color: '#0F172A' }}>
              {formatBRL(resolvedCard.singleTotal)}
            </strong>
          </StatBox>
          <StatBox>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Parceladas</span>
            <strong style={{ fontSize: '0.96rem', color: '#4F46E5' }}>
              {formatBRL(resolvedCard.installmentsTotal)}
            </strong>
          </StatBox>
          <StatBox>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Recorrentes</span>
            <strong style={{ fontSize: '0.96rem', color: '#0369A1' }}>
              {formatBRL(resolvedCard.recurringTotal)}
            </strong>
          </StatBox>
        </SummaryGrid>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ActionButtonsGrid>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingPurchaseId(null);
                setAddingPurchase(true);
              }}
              style={{ background: '#1E295E', borderColor: '#1E295E' }}
            >
              Nova Compra
            </Button>
            <Button
              icon={<CloudUploadOutlined />}
              onClick={() => onOpenAiImport?.(card.id)}
              style={{ borderColor: '#4F46E5', color: '#4F46E5', fontWeight: 700 }}
            >
              Ler Fatura (IA)
            </Button>
          </ActionButtonsGrid>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size='small'
              type='text'
              icon={<SettingOutlined />}
              onClick={() => {
                setManualValueInput(resolvedCard.effectiveValue);
                setEditingManualTotal((v) => !v);
              }}
            >
              Definir valor manual / ajuste
            </Button>
          </div>
        </div>

        {editingManualTotal && (
          <InlineEditorBox>
            <FieldLabel>
              Valor total desejado para a fatura de {formatMonthYear(selectedMonth)}
            </FieldLabel>
            <CurrencyInput
              value={manualValueInput}
              onChange={setManualValueInput}
              compact
            />
            <FormActionsRow>
              <Button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditingManualTotal(false)}
              >
                Cancelar
              </Button>
              <Button
                type='primary'
                loading={saving}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSaveManualOverride}
              >
                Aplicar
              </Button>
            </FormActionsRow>
          </InlineEditorBox>
        )}

        {addingPurchase && (
          <PurchaseFormEditor
            onSave={handleAddPurchase}
            onCancel={() => setAddingPurchase(false)}
            saving={saving}
          />
        )}

        {/* Purchases list */}
        <div style={{ maxHeight: '48dvh', overflowY: 'auto', paddingRight: 2 }}>
          {purchasesList.length === 0 && !addingPurchase ? (
            <EmptyBox>
              <span>
                Nenhuma compra detalhada em {formatMonthYear(selectedMonth)}.
              </span>
              <span style={{ fontSize: '0.8rem' }}>
                Toque em <strong>Nova Compra</strong> ou em <strong>Ler Fatura (IA)</strong> para anexar seu PDF/print!
              </span>
            </EmptyBox>
          ) : (
            <ItemsList>
              {purchasesList.map((purchase) =>
                editingPurchaseId === purchase.id ? (
                  <PurchaseFormEditor
                    key={purchase.id}
                    initialItem={purchase}
                    onSave={(vals) => handleUpdatePurchase(purchase.id, vals)}
                    onCancel={() => setEditingPurchaseId(null)}
                    saving={saving}
                  />
                ) : (
                  <ListItemCard key={purchase.id} $muted={purchase.effectiveDisabled}>
                    <ItemInfo>
                      <ItemTitleRow>
                        <ItemName $strike={purchase.effectiveDisabled}>
                          {purchase.name}
                        </ItemName>
                        {purchase.isRecurring ? (
                          <Tag color='cyan' style={{ margin: 0 }}>
                            Mensal
                          </Tag>
                        ) : purchase.totalInstallments > 1 ? (
                          <Tag color='geekblue' style={{ margin: 0 }}>
                            {purchase.currentInstallment}/{purchase.totalInstallments}
                          </Tag>
                        ) : (
                          <Tag style={{ margin: 0 }}>À vista</Tag>
                        )}
                        {purchase.purchase_date && (
                          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                            {purchase.purchase_date}
                          </span>
                        )}
                      </ItemTitleRow>
                      <ItemAmount
                        $color={
                          purchase.effectiveDisabled
                            ? '#64748B'
                            : purchase.effectiveValue < 0
                            ? '#16A34A'
                            : '#DC2626'
                        }
                      >
                        {formatBRL(purchase.effectiveValue)}
                      </ItemAmount>
                    </ItemInfo>

                    <ItemActions>
                      <IconActionBtn
                        type='button'
                        onClick={() => handleTogglePurchaseDisabled(purchase)}
                        aria-label='Ignorar nesta fatura'
                      >
                        <StopOutlined />
                      </IconActionBtn>

                      <IconActionBtn
                        type='button'
                        $color='#D97706'
                        onClick={() => setEditingPurchaseId(purchase.id)}
                        aria-label='Editar compra'
                      >
                        <EditOutlined />
                      </IconActionBtn>

                      <IconActionBtn
                        type='button'
                        $color='#DC2626'
                        onClick={() => handleDeletePurchase(purchase)}
                        aria-label='Excluir compra'
                      >
                        <DeleteOutlined />
                      </IconActionBtn>
                    </ItemActions>
                  </ListItemCard>
                )
              )}
            </ItemsList>
          )}
        </div>
      </div>
    </Modal>
  );
}
