import React from 'react';
import styled from 'styled-components';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useMonthlyFinancialView } from '../../../services/useMonthlyFinancialView';
import { formatBRL } from '../../../utils/currency';

const Card = styled.div`
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 18px 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 800;
  font-size: 0.95rem;
  color: #1E295E;
`;

const AlertBox = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AlertTitle = styled.div`
  font-weight: 700;
  font-size: 0.92rem;
  color: #B45309;
`;

const AlertDesc = styled.div`
  font-size: 0.84rem;
  color: #78350F;
  line-height: 1.4;
`;

const BreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  padding-top: 4px;
  border-top: 1px dashed #FCD34D;
  color: #451A03;
`;

const HealthyBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #15803D;
  font-size: 0.88rem;
  font-weight: 600;
`;

export default function AlertsCard() {
  const {
    willReceive,
    totalDebts,
    totalDebtorsPending,
    monthlyLoss,
    debtorDependency,
  } = useMonthlyFinancialView();

  const alerts = [];
  if (debtorDependency) {
    alerts.push({
      key: 'debtorDependency',
      title: 'Dependência de devedores',
      description:
        'Você depende do pagamento de um ou mais devedores para fechar as contas deste mês no azul.',
      stats: [
        { label: 'Com devedores:', value: formatBRL(willReceive) },
        {
          label: 'Sem devedores:',
          value: formatBRL(Math.max(0, willReceive - totalDebtorsPending)),
        },
      ],
    });
  }

  if (monthlyLoss) {
    alerts.push({
      key: 'loss',
      title: 'Despesas maiores que os ganhos do mês',
      description:
        'O total de contas pendentes deste mês supera o que você ainda tem a receber.',
      stats: [
        { label: 'A receber:', value: formatBRL(willReceive) },
        { label: 'A pagar:', value: formatBRL(totalDebts) },
        { label: 'Diferença:', value: formatBRL(totalDebts - willReceive) },
      ],
    });
  }

  return (
    <Card>
      <Header>
        <span>
          <ExclamationCircleOutlined style={{ marginRight: 6, color: '#D97706' }} />
          Alertas do Mês
        </span>
        <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </Header>

      {alerts.length === 0 ? (
        <HealthyBox>
          <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
          <span>Nenhum alerta financeiro para este mês!</span>
        </HealthyBox>
      ) : (
        alerts.map((al) => (
          <AlertBox key={al.key}>
            <AlertTitle>{al.title}</AlertTitle>
            <AlertDesc>{al.description}</AlertDesc>
            {al.stats.map((st) => (
              <BreakdownRow key={st.label}>
                <span>{st.label}</span>
                <strong>{st.value}</strong>
              </BreakdownRow>
            ))}
          </AlertBox>
        ))
      )}
    </Card>
  );
}
