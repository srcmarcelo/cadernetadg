import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  LoadingOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Button, Input, InputNumber, Modal, Radio, Spin, Tag, message } from 'antd';
import { useSelector } from 'react-redux';
import { useSession, useSupabaseClient } from '../../services/supabaseClient';
import {
  getCurrentBalance,
  getKeptBalance,
  getSelectedMonth,
} from '../../containers/Main/redux/reducer';
import {
  getFixedReceipts,
  getExtraReceipts,
  getDebtors,
} from '../../containers/Income/redux/reducer';
import {
  getFixedDebts,
  getExtraDebts,
  getCreditCards,
  getCardPurchases,
} from '../../containers/Outcome/redux/reducer';
import { formatBRL } from '../../utils/currency';
import { formatMonthYear } from '../../utils/monthUtils';
import {
  applyScenarioToProjection,
  computeMultiMonthProjection,
} from '../../utils/financialProjection';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const SectionBox = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

const MetricTile = styled.div`
  background: #FFFFFF;
  border: 1px solid ${({ $border }) => $border || '#E2E8F0'};
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetricTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748B;
`;

const MetricVal = styled.span`
  font-size: 1.12rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0F172A'};
`;

const SeriesScroll = styled.div`
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  background: #FFFFFF;
`;

const SeriesRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr 1fr 1fr;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #F1F5F9;
  font-size: 0.85rem;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 520px) {
    grid-template-columns: 90px 1fr 1fr;
    & > span:nth-child(3) {
      display: none;
    }
  }
`;

const SeriesHeader = styled(SeriesRow)`
  background: #F1F5F9;
  font-weight: 700;
  color: #475569;
  font-size: 0.78rem;
  position: sticky;
  top: 0;
  z-index: 2;
`;

const PresetPill = styled.button`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #C7D2FE;
  background: #EEF2FF;
  color: #1E295E;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: #E0E7FF;
  }
`;

const AiAnalysisBox = styled.div`
  background: #FAF5FF;
  border: 1px solid #E9D5FF;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  white-space: pre-wrap;
  line-height: 1.5;
  color: #3B0764;
  font-size: 0.9rem;
`;

export default function FinancialAnalysisModal({ open, onClose }) {
  const selectedMonth = useSelector(getSelectedMonth);
  const currentBalance = useSelector(getCurrentBalance);
  const fixedReceipts = useSelector(getFixedReceipts);
  const extraReceipts = useSelector(getExtraReceipts);
  const debtors = useSelector(getDebtors);
  const fixedDebts = useSelector(getFixedDebts);
  const extraDebts = useSelector(getExtraDebts);
  const creditCards = useSelector(getCreditCards);
  const cardPurchases = useSelector(getCardPurchases);

  const session = useSession();
  const supabase = useSupabaseClient();

  const [monthsCount, setMonthsCount] = useState(12);
  const [userQuery, setUserQuery] = useState('');
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Compute 12-month baseline
  const baseline = useMemo(() => {
    return computeMultiMonthProjection({
      startMonth: selectedMonth,
      monthsCount,
      currentBalance,
      fixedReceipts,
      extraReceipts,
      debts: debtors,
      fixedDebts,
      extraDebts,
      creditCards,
      cardPurchases,
    });
  }, [
    selectedMonth,
    monthsCount,
    currentBalance,
    fixedReceipts,
    extraReceipts,
    debtors,
    fixedDebts,
    extraDebts,
    creditCards,
    cardPurchases,
  ]);

  // Active projection to show in the table (baseline or AI simulation)
  const displaySeries = aiResult?.simulationSeries || baseline.series;
  const displayMetrics = aiResult?.metrics || {
    worstDeficit: Math.min(...baseline.series.map((s) => s.closing)),
    worstMonth: baseline.series.reduce(
      (worst, cur) => (cur.closing < worst.closing ? cur : worst),
      baseline.series[0] || { month: null, closing: 0 }
    ).month,
    endBalance: baseline.series[baseline.series.length - 1]?.closing ?? 0,
    isHealthyAtEnd: (baseline.series[baseline.series.length - 1]?.closing ?? 0) >= 0,
    firstBalancedMonth: baseline.series.find((s) => s.closing >= 0)?.month || null,
  };

  const PRESETS = [
    'Se eu pegar um empréstimo de 15 mil com juros de 5.5% a.m. em 24x, como ficam as contas?',
    'Quanto eu posso gastar de cartão de crédito por mês para me manter no azul?',
    'Se eu cortar R$ 500 de despesas todos os meses, em quanto tempo elimino o déficit?',
  ];

  const handleRunAiAnalysis = async (customText) => {
    const promptToSend = (typeof customText === 'string' ? customText : userQuery).trim();
    if (!promptToSend) {
      message.warning('Digite uma pergunta ou simulação.');
      return;
    }

    setAnalyzingAi(true);
    setAiResult(null);

    try {
      let accessToken = session?.access_token || '';
      if (supabase?.auth) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          accessToken = sessionData.session.access_token;
        }
      }

      const res = await fetch('/api/financial-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          baselineSeries: baseline.series,
          userQuery: promptToSend,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error || 'Não foi possível gerar a análise.');
      }

      setAiResult(body);
      setUserQuery(promptToSend);
      message.success('Simulação e análise de IA concluídas!');
    } catch (err) {
      message.error(err?.message || 'Erro ao comunicar com a IA.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <LineChartOutlined style={{ color: '#4F46E5' }} />
          Análise Geral da Situação & Projeção
        </span>
      }
    >
      <Container>
        {/* Top Summary Metrics */}
        <MetricsGrid>
          <MetricTile
            $border={displayMetrics.isHealthyAtEnd ? '#BBF7D0' : '#FECACA'}
          >
            <MetricTitle>Saldo Final ({monthsCount}m)</MetricTitle>
            <MetricVal
              $color={displayMetrics.isHealthyAtEnd ? '#15803D' : '#DC2626'}
            >
              {formatBRL(displayMetrics.endBalance)}
            </MetricVal>
          </MetricTile>

          <MetricTile $border='#FDE68A'>
            <MetricTitle>Pior Ponto Acumulado</MetricTitle>
            <MetricVal $color={displayMetrics.worstDeficit < 0 ? '#DC2626' : '#15803D'}>
              {formatBRL(displayMetrics.worstDeficit)}
            </MetricVal>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
              em {displayMetrics.worstMonth ? formatMonthYear(displayMetrics.worstMonth) : '-'}
            </span>
          </MetricTile>

          <MetricTile $border='#BFDBFE'>
            <MetricTitle>Equilíbrio no Azul</MetricTitle>
            <MetricVal $color='#1D4ED8' style={{ fontSize: '1rem' }}>
              {displayMetrics.firstBalancedMonth
                ? formatMonthYear(displayMetrics.firstBalancedMonth)
                : 'Não equilibra'}
            </MetricVal>
          </MetricTile>
        </MetricsGrid>

        {/* AI Simulation Box */}
        <SectionBox>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ color: '#1E295E', fontSize: '0.92rem' }}>
              <ExperimentOutlined style={{ marginRight: 6, color: '#4F46E5' }} />
              Simulador Inteligente com IA (GPT-6 Luna)
            </strong>
            {aiResult && (
              <Button size='small' onClick={() => setAiResult(null)}>
                Voltar à projeção atual
              </Button>
            )}
          </div>

          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Pergunte como ficariam seus meses com empréstimos, metas de cartão de crédito ou cortes de gastos.
          </span>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESETS.map((p, idx) => (
              <PresetPill key={idx} type='button' onClick={() => handleRunAiAnalysis(p)}>
                {p}
              </PresetPill>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder='Ex: Se eu pegar empréstimo de 15 mil a 5.5% em 24x...'
              onPressEnter={() => handleRunAiAnalysis()}
              disabled={analyzingAi}
              style={{ borderRadius: 10 }}
            />
            <Button
              type='primary'
              icon={analyzingAi ? <LoadingOutlined /> : <SendOutlined />}
              onClick={() => handleRunAiAnalysis()}
              loading={analyzingAi}
              style={{
                background: '#4F46E5',
                borderColor: '#4F46E5',
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              Simular
            </Button>
          </div>

          {aiResult && (
            <AiAnalysisBox>
              <div style={{ fontWeight: 800, color: '#4C1D95' }}>
                Diagnóstico e Cenário Simulado:
              </div>
              <div>{aiResult.analysis}</div>
              {aiResult.loanCalculations && (
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #DDD6FE',
                    fontSize: '0.82rem',
                  }}
                >
                  <strong>Cálculo do Empréstimo (Tabela Price):</strong> Parcela de{' '}
                  {formatBRL(aiResult.loanCalculations.installmentValue)}/mês | Total pago:{' '}
                  {formatBRL(aiResult.loanCalculations.totalPayment)} (Juros:{' '}
                  {formatBRL(aiResult.loanCalculations.totalInterest)})
                </div>
              )}
            </AiAnalysisBox>
          )}
        </SectionBox>

        {/* Projection Series Table */}
        <SectionBox>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ color: '#1E295E', fontSize: '0.92rem' }}>
              Evolução Mês a Mês ({aiResult ? 'Cenário Simulado' : 'Situação Atual'})
            </strong>
            <Radio.Group
              size='small'
              value={monthsCount}
              onChange={(e) => setMonthsCount(e.target.value)}
            >
              <Radio.Button value={6}>6m</Radio.Button>
              <Radio.Button value={12}>12m</Radio.Button>
              <Radio.Button value={24}>24m</Radio.Button>
            </Radio.Group>
          </div>

          <SeriesScroll>
            <SeriesHeader>
              <span>Mês</span>
              <span>Saídas (Dívidas)</span>
              <span>Líquido Mês</span>
              <span style={{ textAlign: 'right' }}>Saldo Acumulado</span>
            </SeriesHeader>
            {displaySeries.map((row) => {
              const isPositiveClose = row.closing >= 0;
              return (
                <SeriesRow key={row.month}>
                  <strong>{formatMonthYear(row.month)}</strong>
                  <span style={{ color: '#DC2626' }}>{formatBRL(row.totalDebts)}</span>
                  <span style={{ color: row.monthlyNet >= 0 ? '#16A34A' : '#DC2626' }}>
                    {formatBRL(row.monthlyNet)}
                  </span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontWeight: 800,
                      color: isPositiveClose ? '#15803D' : '#DC2626',
                    }}
                  >
                    {formatBRL(row.closing)}
                  </span>
                </SeriesRow>
              );
            })}
          </SeriesScroll>
        </SectionBox>
      </Container>
    </Modal>
  );
}
