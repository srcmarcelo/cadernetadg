import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Skeleton } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getSyncing,
  setCurrentDebtorDependency,
  setMonthlyLoss,
  setTotalDebtorsDebts,
  setTotalDebts,
  setWillReceive,
} from '../../containers/Main/redux/reducer';
import { useMonthlyFinancialView } from '../../services/useMonthlyFinancialView';
import { formatBRL } from '../../utils/currency';

const HeaderCard = styled.div`
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 10px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  border-radius: 10px;
  background: #F8FAFC;

  @media (max-width: 480px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 7px 10px;
  }
`;

const MetricLabel = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748B;
`;

const MetricAmount = styled.span`
  font-size: 1.05rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0F172A'};
`;

const BottomPills = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SummaryPill = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg || '#F8FAFC'};
  border: 1px solid ${({ $border }) => $border || '#E2E8F0'};
  text-align: center;

  ${({ $fullMobile }) =>
    $fullMobile
      ? `
    @media (max-width: 520px) {
      grid-column: 1 / -1;
    }
  `
      : ''}
`;

const PillTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ $color }) => $color || '#475569'};
`;

const PillValue = styled.span`
  font-size: 1.05rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0F172A'};
  margin-top: 2px;
`;

export default function MainInfo() {
  const dispatch = useDispatch();
  const syncing = useSelector(getSyncing);
  const view = useMonthlyFinancialView();

  const {
    willReceive,
    totalDebts,
    totalDebtorsPending,
    monthlyNet,
    openingBalance,
    closingBalance,
    monthlyLoss,
    debtorDependency,
    isPastMonth,
    isFutureMonth,
  } = view;

  // Keep Redux summary fields synchronized for backwards compatibility
  useEffect(() => {
    dispatch(setWillReceive(willReceive));
    dispatch(setTotalDebts(totalDebts));
    dispatch(setTotalDebtorsDebts(totalDebtorsPending));
    dispatch(setMonthlyLoss(monthlyLoss));
    dispatch(setCurrentDebtorDependency(debtorDependency));
  }, [
    dispatch,
    willReceive,
    totalDebts,
    totalDebtorsPending,
    monthlyLoss,
    debtorDependency,
  ]);

  if (syncing) {
    return (
      <HeaderCard className='main-info'>
        <Skeleton active paragraph={{ rows: 2 }} />
      </HeaderCard>
    );
  }

  const alertCount = (monthlyLoss ? 1 : 0) + (debtorDependency ? 1 : 0);
  const isPositiveNet = monthlyNet >= 0;
  const isPositiveClose = closingBalance >= 0;

  return (
    <HeaderCard className='main-info'>
      <MetricsGrid>
        {!isPastMonth && (
          <MetricItem className='currentBalanceInfo'>
            <MetricLabel>
              {isFutureMonth ? 'Saldo inicial projetado:' : 'Quanto tem agora:'}
            </MetricLabel>
            <MetricAmount $color='#16A34A'>{formatBRL(openingBalance)}</MetricAmount>
          </MetricItem>
        )}
        <MetricItem className='willReceiveInfo'>
          <MetricLabel>
            {isPastMonth
              ? 'Pendente a receber:'
              : isFutureMonth
              ? 'Quanto receberá:'
              : 'Ainda receberá:'}
          </MetricLabel>
          <MetricAmount $color='#16A34A'>{formatBRL(willReceive)}</MetricAmount>
        </MetricItem>
        <MetricItem className='totalDebtsInfo'>
          <MetricLabel>
            {isPastMonth
              ? 'Pendente a pagar:'
              : isFutureMonth
              ? 'Quanto deverá:'
              : 'Ainda deve:'}
          </MetricLabel>
          <MetricAmount $color='#DC2626'>{formatBRL(totalDebts)}</MetricAmount>
        </MetricItem>
      </MetricsGrid>

      <BottomPills>
        <SummaryPill
          className='monthlyBalance'
          $bg={isPositiveNet ? '#F0FDF4' : '#FEF2F2'}
          $border={isPositiveNet ? '#BBF7D0' : '#FECACA'}
        >
          <PillTitle $color={isPositiveNet ? '#15803D' : '#B91C1C'}>
            {isPositiveNet ? 'Saldo do Mês' : 'Déficit do Mês'}
          </PillTitle>
          <PillValue $color={isPositiveNet ? '#15803D' : '#B91C1C'}>
            {formatBRL(Math.abs(monthlyNet))}
          </PillValue>
        </SummaryPill>

        {alertCount > 0 && (
          <SummaryPill $bg='#FFFBEB' $border='#FDE68A' $fullMobile>
            <PillTitle $color='#B45309'>
              <WarningOutlined /> {alertCount} {alertCount > 1 ? 'Alertas' : 'Alerta'}
            </PillTitle>
            <PillValue $color='#D97706' style={{ fontSize: '0.84rem', fontWeight: 600 }}>
              {alertCount > 1
                ? 'Veja detalhes no Painel'
                : debtorDependency
                ? 'Dependência de devedores'
                : 'Saldo mensal negativo'}
            </PillValue>
          </SummaryPill>
        )}

        {!isPastMonth && (
          <SummaryPill
            className='generalBalance'
            $bg={isPositiveClose ? '#EFF6FF' : '#FEF2F2'}
            $border={isPositiveClose ? '#BFDBFE' : '#FECACA'}
          >
            <PillTitle $color={isPositiveClose ? '#1D4ED8' : '#B91C1C'}>
              {isPositiveClose ? 'Restará no Fim' : 'Faltará no Fim'}
            </PillTitle>
            <PillValue $color={isPositiveClose ? '#1D4ED8' : '#B91C1C'}>
              {formatBRL(Math.abs(closingBalance))}
            </PillValue>
          </SummaryPill>
        )}
      </BottomPills>
    </HeaderCard>
  );
}
