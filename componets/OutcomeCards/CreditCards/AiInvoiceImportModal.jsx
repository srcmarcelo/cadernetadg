import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  FileSearchOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Tag,
  message,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../../store';
import { useSession, useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { getCreditCards } from '../../../containers/Outcome/redux/reducer';
import {
  batchImportCardPurchases,
  createCreditCard,
} from '../../../containers/Outcome/redux';
import { formatBRL, roundMoney } from '../../../utils/currency';
import { addMonths, formatMonthYear } from '../../../utils/monthUtils';
import CurrencyInput from '../../CurrencyInput';

const DropZone = styled.div`
  width: 100%;
  padding: 28px 20px;
  border-radius: 14px;
  border: 2px dashed #6366F1;
  background: #EEF2FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.18s;

  &:hover {
    background: #E0E7FF;
  }
`;

const SummaryStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  margin: 12px 0;
`;

const SummaryBox = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemsScroll = styled.div`
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #F8FAFC;
`;

const ExtractedRow = styled.div`
  display: grid;
  grid-template-columns: 26px 1fr 120px 135px;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 9px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;

  @media (max-width: 580px) {
    grid-template-columns: 26px 1fr;
  }
`;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

export default function AiInvoiceImportModal({
  open,
  onClose,
  preselectedCardId = null,
  selectedMonth,
  onImported,
}) {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();
  const session = useSession();
  const creditCards = useSelector(getCreditCards);

  const fileInputRef = useRef(null);

  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [items, setItems] = useState([]);
  const [invoiceMonth, setInvoiceMonth] = useState(selectedMonth);
  const [targetCardChoice, setTargetCardChoice] = useState(preselectedCardId || '__new__');
  const [newCardName, setNewCardName] = useState('');
  const [applyAdjustment, setApplyAdjustment] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const resetState = () => {
    setParsing(false);
    setSaving(false);
    setExtracted(null);
    setItems([]);
    setErrorMsg('');
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  const handleFilePicked = async (file) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      message.error('O arquivo deve ter no máximo 12 MB.');
      return;
    }

    setErrorMsg('');
    setParsing(true);

    try {
      const base64Data = await readFileAsBase64(file);
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          base64Data,
          targetMonth: selectedMonth,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Não foi possível ler a fatura.');
      }

      const inv = body.invoice;
      setExtracted(inv);
      setItems(inv.items || []);
      setInvoiceMonth(inv.reference_month || selectedMonth);

      // Auto-match existing card by name if not preselected
      if (preselectedCardId) {
        setTargetCardChoice(preselectedCardId);
      } else {
        const detected = (inv.card_name || '').toLowerCase();
        const match = detected
          ? creditCards.find(
              (c) =>
                c.name.toLowerCase().includes(detected) ||
                detected.includes(c.name.toLowerCase())
            )
          : null;
        if (match) {
          setTargetCardChoice(match.id);
        } else if (creditCards.length > 0 && !detected) {
          setTargetCardChoice(creditCards[0].id);
        } else {
          setTargetCardChoice('__new__');
          setNewCardName(inv.card_name || 'Cartão de Crédito');
        }
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Erro ao analisar o documento.');
    } finally {
      setParsing(false);
    }
  };

  const selectedItems = useMemo(() => items.filter((it) => it.selected), [items]);
  const selectedSum = useMemo(
    () => roundMoney(selectedItems.reduce((acc, it) => acc + Number(it.value || 0), 0)),
    [selectedItems]
  );
  const residualDiff = useMemo(() => {
    if (!extracted?.invoice_total) return 0;
    return roundMoney(extracted.invoice_total - selectedSum);
  }, [extracted, selectedSum]);

  const updateItemField = (tempId, patch) => {
    setItems((prev) =>
      prev.map((it) => (it.tempId === tempId ? { ...it, ...patch } : it))
    );
  };

  const handleConfirmImport = async () => {
    if (selectedItems.length === 0 && !extracted?.invoice_total) {
      message.warning('Selecione ao menos um lançamento para importar.');
      return;
    }

    setSaving(true);
    try {
      let cardId = targetCardChoice;
      if (cardId === '__new__') {
        const nameToCreate = (newCardName || extracted?.card_name || 'Cartão').trim();
        const createdCard = await createCreditCard({
          dispatch,
          supabase,
          user,
          name: nameToCreate,
          dueDay: extracted?.due_day,
          closingDay: extracted?.closing_day,
          selectedMonth: invoiceMonth,
        });
        cardId = createdCard.id;
      }

      const adjustment =
        applyAdjustment && Math.abs(residualDiff) >= 0.01 ? residualDiff : 0;

      await batchImportCardPurchases({
        dispatch,
        getState: store.getState,
        supabase,
        user,
        cardId,
        items: selectedItems,
        invoiceMonth,
        manualAdjustment: adjustment,
        dueDay: extracted?.due_day,
        closingDay: extracted?.closing_day,
      });

      message.success(
        `${selectedItems.length} lançamento(s) importado(s) com sucesso para ${formatMonthYear(
          invoiceMonth
        )}!`
      );
      onImported?.(cardId, invoiceMonth);
      handleClose();
    } catch {
      message.error('Erro ao salvar os itens da fatura.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={720}
      title={
        <span>
          <FileSearchOutlined style={{ marginRight: 8, color: '#4F46E5' }} />
          Importar Fatura com Inteligência Artificial
        </span>
      }
      centered
    >
      <input
        ref={fileInputRef}
        type='file'
        accept='.pdf,.png,.jpg,.jpeg,.webp,.csv,.ofx,.txt,application/pdf,image/*'
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFilePicked(f);
          e.target.value = '';
        }}
      />

      {!extracted && !parsing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DropZone
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer?.files?.[0];
              if (f) handleFilePicked(f);
            }}
          >
            <CloudUploadOutlined style={{ fontSize: '2.4rem', color: '#4F46E5' }} />
            <strong style={{ fontSize: '1rem', color: '#1E295E' }}>
              Clique ou arraste o arquivo da sua fatura aqui
            </strong>
            <span style={{ fontSize: '0.84rem', color: '#475569' }}>
              Aceita PDF da fatura, print/foto (JPG, PNG, WEBP) ou extrato CSV/OFX.
              <br />A IA identifica automaticamente o valor total, compras à vista e{' '}
              <strong>projeta as parcelas nos próximos meses</strong>!
            </span>
            <Tag color='purple'>Privacidade total: o arquivo não fica salvo no servidor</Tag>
          </DropZone>

          {errorMsg && <Alert type='error' showIcon message={errorMsg} />}
        </div>
      )}

      {parsing && (
        <div
          style={{
            padding: '48px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            textAlign: 'center',
          }}
        >
          <Spin size='large' />
          <strong style={{ color: '#1E295E', fontSize: '1rem' }}>
            Extraindo compras, valores e parcelas da fatura...
          </strong>
          <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Isso costuma levar apenas alguns segundos.
          </span>
        </div>
      )}

      {extracted && !parsing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Cartão de crédito
              </div>
              <Select
                style={{ width: '100%' }}
                value={targetCardChoice}
                onChange={(val) => {
                  setTargetCardChoice(val);
                  if (val === '__new__' && !newCardName) {
                    setNewCardName(extracted.card_name || 'Novo Cartão');
                  }
                }}
                options={[
                  ...creditCards.map((c) => ({ value: c.id, label: c.name })),
                  {
                    value: '__new__',
                    label: `+ Criar novo cartão${
                      extracted.card_name ? ` (${extracted.card_name})` : ''
                    }`,
                  },
                ]}
              />
              {targetCardChoice === '__new__' && (
                <Input
                  style={{ marginTop: 6 }}
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder='Nome do novo cartão (ex: Nubank)'
                />
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Mês de referência da fatura
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => setInvoiceMonth((m) => addMonths(m, -1))}
                />
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#1E295E',
                    padding: '5px 8px',
                    background: '#F1F5F9',
                    borderRadius: 8,
                  }}
                >
                  {formatMonthYear(invoiceMonth)}
                </div>
                <Button
                  icon={<RightOutlined />}
                  onClick={() => setInvoiceMonth((m) => addMonths(m, 1))}
                />
              </div>
            </div>
          </div>

          <SummaryStrip>
            <SummaryBox>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Total lido na fatura</span>
              <strong style={{ fontSize: '1.05rem', color: '#DC2626' }}>
                {formatBRL(extracted.invoice_total)}
              </strong>
            </SummaryBox>
            <SummaryBox>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Soma dos itens marcados</span>
              <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>
                {formatBRL(selectedSum)}
              </strong>
            </SummaryBox>
            <SummaryBox>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Parceladas detectadas</span>
              <strong style={{ fontSize: '1.05rem', color: '#4F46E5' }}>
                {selectedItems.filter((i) => i.installments > 1).length} compra(s)
              </strong>
            </SummaryBox>
          </SummaryStrip>

          <ItemsScroll>
            {items.map((it) => {
              const endMonthLabel =
                it.installments > 1
                  ? formatMonthYear(
                      addMonths(invoiceMonth, it.installments - it.current_installment),
                      { short: true }
                    )
                  : null;

              return (
                <ExtractedRow key={it.tempId}>
                  <Checkbox
                    checked={it.selected}
                    onChange={(e) =>
                      updateItemField(it.tempId, { selected: e.target.checked })
                    }
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Input
                      size='small'
                      value={it.name}
                      onChange={(e) =>
                        updateItemField(it.tempId, { name: e.target.value })
                      }
                    />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {it.purchase_date && (
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {it.purchase_date}
                        </span>
                      )}
                      <Tag style={{ margin: 0, fontSize: '0.7rem' }}>{it.category}</Tag>
                      {endMonthLabel && (
                        <Tag color='geekblue' style={{ margin: 0, fontSize: '0.7rem' }}>
                          Vai até {endMonthLabel}
                        </Tag>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <InputNumber
                      size='small'
                      min={1}
                      max={99}
                      value={it.current_installment}
                      onChange={(v) => {
                        const cur = v || 1;
                        updateItemField(it.tempId, {
                          current_installment: cur,
                          installments: Math.max(cur, it.installments),
                        });
                      }}
                      style={{ width: 52 }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>/</span>
                    <InputNumber
                      size='small'
                      min={1}
                      max={99}
                      value={it.installments}
                      onChange={(v) =>
                        updateItemField(it.tempId, {
                          installments: Math.max(it.current_installment, v || 1),
                        })
                      }
                      style={{ width: 52 }}
                    />
                  </div>

                  <CurrencyInput
                    compact
                    allowNegative
                    value={it.value}
                    onChange={(v) => updateItemField(it.tempId, { value: v })}
                  />
                </ExtractedRow>
              );
            })}
          </ItemsScroll>

          {Math.abs(residualDiff) >= 0.01 && (
            <Checkbox
              checked={applyAdjustment}
              onChange={(e) => setApplyAdjustment(e.target.checked)}
            >
              Adicionar ajuste de diferença ({formatBRL(residualDiff)}) neste mês para igualar ao total lido na fatura ({formatBRL(extracted.invoice_total)})
            </Checkbox>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <Button onClick={resetState}>Enviar outro arquivo</Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button
                type='primary'
                icon={<CheckCircleOutlined />}
                loading={saving}
                onClick={handleConfirmImport}
                style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
              >
                Importar {selectedItems.length} Lançamentos
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
