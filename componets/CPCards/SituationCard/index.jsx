import React from 'react';
import styled from 'styled-components';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  WarningFilled,
} from '@ant-design/icons';
import { useMonthlyFinancialView } from '../../../services/useMonthlyFinancialView';
import { formatBRL } from '../../../utils/currency';

const Card = styled.div`
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
`;

const HeaderBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-weight: 800;
  font-size: 0.95rem;
`;

const Desc = styled.div`
  font-size: 0.95rem;
  color: #334155;
  max-width: 520px;
  line-height: 1.5;
`;

export default function SituationCard() {
  const view = useMonthlyFinancialView();
  const {
    willReceive,
    totalDebts,
    openingBalance,
    projectedKept,
    isFutureMonth,
    isPastMonth,
  } = view;

  let statusKey = 'pending';
  if (!willReceive && !totalDebts && !openingBalance) {
    statusKey = 'pending';
  } else if (willReceive >= totalDebts) {
    statusKey = 'receipts';
  } else if (!isPastMonth && willReceive + openingBalance >= totalDebts) {
    statusKey = 'balance';
  } else if (!isPastMonth && willReceive + openingBalance + projectedKept >= totalDebts) {
    statusKey = 'kept';
  } else {
    statusKey = 'noway';
  }

  const configs = {
    receipts: {
      title: 'Situação Excelente',
      color: '#15803D',
      bg: '#DCFCE7',
      icon: <CheckCircleFilled />,
      description:
        'Seus recebimentos deste mês cobrem 100% das despesas pendentes sem precisar tocar no seu saldo atual.',
    },
    balance: {
      title: 'Situação Estável',
      color: '#0369A1',
      bg: '#E0F2FE',
      icon: <CheckCircleFilled />,
      description: (
        <span>
          Você conseguirá quitar todas as despesas, utilizando{' '}
          <strong style={{ color: '#DC2626' }}>
            {formatBRL(totalDebts - willReceive)}
          </strong>{' '}
          do seu saldo {isFutureMonth ? 'projetado' : 'atual'}.
        </span>
      ),
    },
    kept: {
      title: 'Atenção: Uso da Reserva',
      color: '#B45309',
      bg: '#FEF3C7',
      icon: <WarningFilled />,
      description: (
        <span>
          Para quitar todas as despesas deste mês, será necessário retirar{' '}
          <strong style={{ color: '#DC2626' }}>
            {formatBRL(totalDebts - willReceive - openingBalance)}
          </strong>{' '}
          do valor que {isFutureMonth ? 'terá' : 'tem'} guardado.
        </span>
      ),
    },
    noway: {
      title: 'Situação Crítica',
      color: '#B91C1C',
      bg: '#FEE2E2',
      icon: <ExclamationCircleFilled />,
      description: (
        <span>
          Com os lançamentos deste mês, faltará{' '}
          <strong style={{ color: '#DC2626' }}>
            {formatBRL(
              Math.max(
                0,
                totalDebts -
                  willReceive -
                  (isPastMonth ? 0 : openingBalance + projectedKept)
              )
            )}
          </strong>{' '}
          {isPastMonth
            ? 'entre recebimentos e despesas pendentes.'
            : 'mesmo utilizando todo o saldo guardado.'}
        </span>
      ),
    },
    pending: {
      title: 'Comece por aqui',
      color: '#1E295E',
      bg: '#E0E7FF',
      icon: <InfoCircleFilled />,
      description: (
        <span>
          Cadastre seus recebimentos na aba{' '}
          <strong style={{ color: '#16A34A' }}>Ganhos</strong> e suas contas ou faturas na aba{' '}
          <strong style={{ color: '#DC2626' }}>Dívidas</strong> para acompanhar sua saúde financeira.
        </span>
      ),
    },
  };

  const cfg = configs[statusKey];

  return (
    <Card>
      <HeaderBadge $bg={cfg.bg} $color={cfg.color}>
        {cfg.icon}
        <span>{cfg.title}</span>
      </HeaderBadge>
      <Desc>{cfg.description}</Desc>
    </Card>
  );
}
