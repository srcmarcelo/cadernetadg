import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  CameraOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
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
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useSession, useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { getCreditCards } from '../../../containers/Outcome/redux/reducer';
import {
  batchImportCardPurchases,
  createCreditCard,
} from '../../../containers/Outcome/redux';
import { formatBRL, roundMoney } from '../../../utils/currency';
import { addMonths, formatMonthYear } from '../../../utils/monthUtils';
import CurrencyInput from '../../CurrencyInput';

const VisuallyHiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const DropZone = styled.div`
  width: 100%;
  padding: 22px 16px;
  border-radius: 14px;
  border: 2px dashed #6366F1;
  background: #EEF2FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
`;

const UploadButtonsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 440px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const NativeUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 11px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  background: ${({ $primary }) => ($primary ? '#4F46E5' : '#FFFFFF')};
  color: ${({ $primary }) => ($primary ? '#FFFFFF' : '#1E295E')};
  border: 1.5px solid ${({ $primary }) => ($primary ? '#4F46E5' : '#C7D2FE')};
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.12);

  &:active {
    transform: scale(0.98);
  }
`;

const SummaryStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr 1fr;

    & > div:first-child {
      grid-column: 1 / -1;
    }
  }
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
  max-height: 44dvh;
  overflow-y: auto;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #F8FAFC;
`;

const ExtractedRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;

  @media (min-width: 620px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const ExtractedTopPart = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const ExtractedBottomControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-left: 24px;

  @media (min-width: 620px) {
    padding-left: 0;
    flex-shrink: 0;
  }
`;

const FooterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado no dispositivo.'));
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
  const reduxStore = useStore();
  const supabase = useSupabaseClient();
  const user = useUser();
  const session = useSession();
  const creditCards = useSelector(getCreditCards);

  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [items, setItems] = useState([]);
  const [invoiceMonth, setInvoiceMonth] = useState(selectedMonth);
  const [targetCardChoice, setTargetCardChoice] = useState(preselectedCardId || '__new__');
  const [newCardName, setNewCardName] = useState('');
  const [applyAdjustment, setApplyAdjustment] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setParsing(false);
      setSaving(false);
      setExtracted(null);
      setItems([]);
      setErrorMsg('');
      setInvoiceMonth(selectedMonth);
      setTargetCardChoice(
        preselectedCardId || (creditCards.length > 0 ? creditCards[0].id : '__new__')
      );
      setNewCardName('');
    }
    wasOpenRef.current = Boolean(open);
  }, [open, preselectedCardId, selectedMonth, creditCards]);

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
    if (file.size > 15 * 1024 * 1024) {
      message.error('O arquivo deve ter no máximo 15 MB.');
      return;
    }

    setErrorMsg('');
    setParsing(true);

    try {
      const base64Data = await readFileAsBase64(file);

      // Always fetch fresh session token so mobile backgrounded tabs never fail with 401
      let accessToken = session?.access_token || '';
      if (supabase?.auth) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          accessToken = sessionData.session.access_token;
        }
      }

      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          filename: file.name || 'fatura.pdf',
          mimeType: file.type || '',
          base64Data,
          targetMonth: selectedMonth,
        }),
      });

      const rawText = await res.text();
      let body = null;
      try {
        body = JSON.parse(rawText);
      } catch {
        if (res.status === 504) {
          throw new Error(
            'O servidor demorou muito para responder (timeout). Tente novamente ou envie apenas o print da página de transações.'
          );
        }
        if (res.status === 413) {
          throw new Error('O arquivo enviado é muito grande.');
        }
        throw new Error(
          `Erro inesperado no servidor (código ${res.status}). Verifique se OPENAI_API_KEY está configurada.`
        );
      }

      if (!res.ok) {
        throw new Error(body?.error || 'Não foi possível ler os dados desta fatura.');
      }

      const inv = body.invoice;
      if (!inv || ((!inv.items || inv.items.length === 0) && !inv.invoice_total)) {
        throw new Error(
          'Nenhum lançamento foi identificado neste documento. Verifique se enviou a fatura completa ou print legível.'
        );
      }

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

      const finalTotal = roundMoney(selectedSum + adjustment);

      await batchImportCardPurchases({
        dispatch,
        getState: reduxStore.getState,
        supabase,
        user,
        cardId,
        items: selectedItems,
        invoiceMonth,
        manualAdjustment: adjustment,
        computedMonthTotal: finalTotal,
        dueDay: extracted?.due_day,
        closingDay: extracted?.closing_day,
      });

      message.success(
        `${selectedItems.length} lançamento(s) importado(s) em ${formatMonthYear(
          invoiceMonth
        )}!`
      );
      onImported?.(cardId, invoiceMonth);
    } catch (err) {
      console.error('handleConfirmImport error:', err);
      message.error(err?.message || 'Erro ao salvar os itens da fatura.');
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
        <span style={{ paddingRight: 20, display: 'inline-block' }}>
          <FileSearchOutlined style={{ marginRight: 8, color: '#4F46E5' }} />
          Ler Fatura com IA
        </span>
      }
    >
      {/* Separate native file inputs so Android/iOS open Files for PDF and Gallery for Photos */}
      <VisuallyHiddenFileInput
        id='ai-invoice-pdf-input'
        type='file'
        accept='application/pdf,.pdf,.csv,.ofx,.txt,text/csv,text/plain'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFilePicked(f);
          e.target.value = '';
        }}
      />
      <VisuallyHiddenFileInput
        id='ai-invoice-img-input'
        type='file'
        accept='image/*'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFilePicked(f);
          e.target.value = '';
        }}
      />

      {!extracted && !parsing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DropZone
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer?.files?.[0];
              if (f) handleFilePicked(f);
            }}
          >
            <strong style={{ fontSize: '1rem', color: '#1E295E' }}>
              Envie o PDF ou print da sua fatura
            </strong>
            <span style={{ fontSize: '0.84rem', color: '#475569', maxWidth: 460 }}>
              A IA identifica automaticamente todas as compras à vista, assinaturas e{' '}
              <strong>projeta as parcelas nos próximos meses</strong>.
            </span>

            <UploadButtonsRow>
              <NativeUploadLabel htmlFor='ai-invoice-pdf-input' $primary>
                <FilePdfOutlined />
                <span>Escolher PDF / CSV</span>
              </NativeUploadLabel>

              <NativeUploadLabel htmlFor='ai-invoice-img-input'>
                <CameraOutlined />
                <span>Enviar Foto / Print</span>
              </NativeUploadLabel>
            </UploadButtonsRow>

            <Tag
              color='purple'
              style={{
                margin: 0,
                whiteSpace: 'normal',
                textAlign: 'center',
                lineHeight: 1.35,
                padding: '4px 8px',
              }}
            >
              Privacidade total: o arquivo é lido em memória e descartado na hora
            </Tag>
          </DropZone>

          {errorMsg && <Alert type='error' showIcon title={errorMsg} />}
        </div>
      )}

      {parsing && (
        <div
          style={{
            padding: '44px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            textAlign: 'center',
          }}
        >
          <Spin size='large' />
          <strong style={{ color: '#1E295E', fontSize: '1rem' }}>
            Lendo fatura, compras e parcelas com IA...
          </strong>
          <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Aguarde alguns segundos enquanto organizamos todos os lançamentos.
          </span>
        </div>
      )}

      {extracted && !parsing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Salvar no cartão
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
                Mês de vencimento da fatura
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
                    padding: '6px 8px',
                    background: '#F1F5F9',
                    borderRadius: 8,
                    fontSize: '0.9rem',
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
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Total da fatura</span>
              <strong style={{ fontSize: '1.05rem', color: '#DC2626' }}>
                {formatBRL(extracted.invoice_total)}
              </strong>
            </SummaryBox>
            <SummaryBox>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Itens marcados</span>
              <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                {formatBRL(selectedSum)}
              </strong>
            </SummaryBox>
            <SummaryBox>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Parceladas</span>
              <strong style={{ fontSize: '1rem', color: '#4F46E5' }}>
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
                  <ExtractedTopPart>
                    <Checkbox
                      checked={it.selected}
                      onChange={(e) =>
                        updateItemField(it.tempId, { selected: e.target.checked })
                      }
                      style={{ marginTop: 4 }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                      <Input
                        size='small'
                        value={it.name}
                        onChange={(e) =>
                          updateItemField(it.tempId, { name: e.target.value })
                        }
                      />
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                        {it.purchase_date && (
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {it.purchase_date}
                          </span>
                        )}
                        <Tag style={{ margin: 0, fontSize: '0.7rem' }}>{it.category}</Tag>
                        {endMonthLabel && (
                          <Tag color='geekblue' style={{ margin: 0, fontSize: '0.7rem' }}>
                            Até {endMonthLabel}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </ExtractedTopPart>

                  <ExtractedBottomControls>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Parc.</span>
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

                    <div style={{ width: 132 }}>
                      <CurrencyInput
                        compact
                        allowNegative
                        value={it.value}
                        onChange={(v) => updateItemField(it.tempId, { value: v })}
                      />
                    </div>
                  </ExtractedBottomControls>
                </ExtractedRow>
              );
            })}
          </ItemsScroll>

          {Math.abs(residualDiff) >= 0.01 && (
            <Checkbox
              checked={applyAdjustment}
              onChange={(e) => setApplyAdjustment(e.target.checked)}
            >
              Incluir ajuste de diferença ({formatBRL(residualDiff)}) neste mês para bater com o total da fatura ({formatBRL(extracted.invoice_total)})
            </Checkbox>
          )}

          <FooterBar>
            <Button onClick={resetState}>Trocar arquivo</Button>
            <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'flex-end', flex: 1 }}>
              <Button onClick={handleClose} style={{ flex: 1, maxWidth: 130 }}>
                Cancelar
              </Button>
              <Button
                type='primary'
                icon={<CheckCircleOutlined />}
                loading={saving}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleConfirmImport}
                style={{
                  background: '#4F46E5',
                  borderColor: '#4F46E5',
                  fontWeight: 700,
                  flex: 2,
                }}
              >
                Importar ({selectedItems.length})
              </Button>
            </div>
          </FooterBar>
        </div>
      )}
    </Modal>
  );
}
