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
  Tooltip,
  message,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../../store';
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

const ProjectionStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(84px, 1fr));
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const ProjectionPill = styled.button`
  padding: 8px 6px;
  border-radius: 10px;
  border: 1.5px solid ${({ $active }) => ($active ? '#1E295E' : '#E2E8F0')};
  background: ${({ $active }) => ($active ? '#EEF2FF' : '#F8FAFC')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: all 0.15s;

  &:hover {
    border-color: #6366F1;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
  gap: 8px;
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
              placeholder='Ex: Amazon - Fone, Supermercado'
              autoFocus
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
              <Radio.Button value='installment'>Valor da parcela</Radio.Button>
              <Radio.Button value='total'>Valor total da compra</Radio.Button>
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
              <FieldLabel>Parcelamento nesta fatura</FieldLabel>
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
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>de</span>
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
            Salvar Compra
          </Button>
        </div>
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
        getState: store.getState,
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
        getState: store.getState,
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
      getState: store.getState,
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
          getState: store.getState,
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24, flexWrap: 'wrap', gap: 8 }}>
          <span>
            Fatura <strong>{card.name}</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Button
              size='small'
              icon={<LeftOutlined />}
              onClick={() => dispatch(setSelectedMonth(addMonths(selectedMonth, -1)))}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E295E', minWidth: 135, textAlign: 'center' }}>
              {formatMonthYear(selectedMonth)}
            </span>
            <Button
              size='small'
              icon={<RightOutlined />}
              onClick={() => dispatch(setSelectedMonth(addMonths(selectedMonth, 1)))}
            />
          </div>
        </div>
      }
      centered
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!hasCardPurchasesTable && (
          <Alert
            type='warning'
            showIcon
            message='Execute a migração SQL no Supabase para sincronizar o detalhamento das compras entre dispositivos (arquivo em supabase/migrations/).'
          />
        )}

        {/* 6-month projection strip */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
            PROJEÇÃO DAS PRÓXIMAS FATURAS (CLIQUE PARA NAVEGAR)
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

        {/* Summary breakdown */}
        <SummaryGrid>
          <StatBox $highlight>
            <span style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: 600 }}>
              Total da Fatura
            </span>
            <strong style={{ fontSize: '1.15rem', color: '#DC2626' }}>
              {formatBRL(resolvedCard.effectiveValue)}
            </strong>
          </StatBox>
          <StatBox>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>À vista</span>
            <strong style={{ fontSize: '0.98rem', color: '#0F172A' }}>
              {formatBRL(resolvedCard.singleTotal)}
            </strong>
          </StatBox>
          <StatBox>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Parceladas</span>
            <strong style={{ fontSize: '0.98rem', color: '#4F46E5' }}>
              {formatBRL(resolvedCard.installmentsTotal)}
            </strong>
          </StatBox>
          <StatBox>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Recorrentes</span>
            <strong style={{ fontSize: '0.98rem', color: '#0369A1' }}>
              {formatBRL(resolvedCard.recurringTotal)}
            </strong>
          </StatBox>
        </SummaryGrid>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingPurchaseId(null);
                setAddingPurchase(true);
              }}
              style={{ background: '#1E295E', borderColor: '#1E295E' }}
            >
              Nova Compra / Parcelada
            </Button>
            <Button
              icon={<CloudUploadOutlined />}
              onClick={() => onOpenAiImport?.(card.id)}
              style={{ borderColor: '#4F46E5', color: '#4F46E5', fontWeight: 600 }}
            >
              Anexar Fatura (IA)
            </Button>
          </div>

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

        {editingManualTotal && (
          <InlineEditorBox>
            <FieldLabel>
              Definir valor total desejado para a fatura de {formatMonthYear(selectedMonth)}
            </FieldLabel>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CurrencyInput
                value={manualValueInput}
                onChange={setManualValueInput}
                compact
              />
              <Button
                type='primary'
                loading={saving}
                onClick={handleSaveManualOverride}
              >
                Aplicar
              </Button>
              <Button onClick={() => setEditingManualTotal(false)}>Cancelar</Button>
            </div>
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
        <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 2 }}>
          {purchasesList.length === 0 && !addingPurchase ? (
            <EmptyBox>
              <span>
                Nenhuma compra detalhada cadastrada em {formatMonthYear(selectedMonth)}.
              </span>
              <span style={{ fontSize: '0.8rem' }}>
                Adicione compras parceladas manualmente ou anexe o PDF/print da fatura para a IA cadastrar tudo automaticamente!
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
                          <Tag color='cyan'>Assinatura mensal</Tag>
                        ) : purchase.totalInstallments > 1 ? (
                          <Tag color='geekblue'>
                            Parcela {purchase.currentInstallment}/
                            {purchase.totalInstallments}
                          </Tag>
                        ) : (
                          <Tag>À vista</Tag>
                        )}
                        {purchase.category && (
                          <Tag color='default'>{purchase.category}</Tag>
                        )}
                        {purchase.purchase_date && (
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
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
                      <Tooltip
                        title={
                          purchase.effectiveDisabled
                            ? 'Reativar nesta fatura'
                            : 'Ignorar nesta fatura'
                        }
                      >
                        <IconActionBtn
                          type='button'
                          onClick={() => handleTogglePurchaseDisabled(purchase)}
                        >
                          <StopOutlined />
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip title='Editar compra'>
                        <IconActionBtn
                          type='button'
                          $color='#D97706'
                          onClick={() => setEditingPurchaseId(purchase.id)}
                        >
                          <EditOutlined />
                        </IconActionBtn>
                      </Tooltip>

                      <Tooltip title='Excluir compra'>
                        <IconActionBtn
                          type='button'
                          $color='#DC2626'
                          onClick={() => handleDeletePurchase(purchase)}
                        >
                          <DeleteOutlined />
                        </IconActionBtn>
                      </Tooltip>
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
