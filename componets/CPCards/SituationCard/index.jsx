import { Spin } from 'antd';
import React, { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getLoadingDebtors,
  getLoadingDebts,
  getLoadingExtraReceipts,
  getLoadingFixedReceipts,
} from '../../../containers/Income/redux/reducer';
import {
  getCurrentBalance,
  getKeptBalance,
  getLoadingCurrentBalance,
  getLoadingKeptBalance,
  getLoadingUserInfo,
  getTotalDebts,
  getWillReceive,
} from '../../../containers/Main/redux/reducer';
import {
  getLoadingCreditCards,
  getLoadingExtraDebts,
  getLoadingFixedDebts,
} from '../../../containers/Outcome/redux/reducer';
import { Container, Description, Situation, Title } from './styles';

export default function SituationCard({ future, pastValue }) {
  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);
  const willReceive = useSelector(getWillReceive);
  const totalDebts = useSelector(getTotalDebts);

  const loadingFixedReceipts = useSelector(getLoadingFixedReceipts);
  const loadingDebtors = useSelector(getLoadingDebtors);
  const loadingDebts = useSelector(getLoadingDebts);
  const loadingExtraReceipts = useSelector(getLoadingExtraReceipts);

  const loadingCurrentBalance = useSelector(getLoadingCurrentBalance);
  const loadingKeptBalance = useSelector(getLoadingKeptBalance);
  const loadingUserInfo = useSelector(getLoadingUserInfo);

  const loadingFixedDebts = useSelector(getLoadingFixedDebts);
  const loadingExtraDebts = useSelector(getLoadingExtraDebts);
  const loadingCreditCards = useSelector(getLoadingCreditCards);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadings = [
      loadingFixedReceipts,
      loadingDebtors,
      loadingDebts,
      loadingExtraReceipts,
      loadingCurrentBalance,
      loadingKeptBalance,
      loadingUserInfo,
      loadingFixedDebts,
      loadingExtraDebts,
      loadingCreditCards,
    ];

    setLoading(loadings.includes(true));
  }, [
    loadingFixedReceipts,
    loadingDebtors,
    loadingDebts,
    loadingExtraReceipts,
    loadingCurrentBalance,
    loadingKeptBalance,
    loadingUserInfo,
    loadingFixedDebts,
    loadingExtraDebts,
    loadingCreditCards,
  ]);

  const actualBalance = useMemo(
    () => (future ? pastValue : currentBalance),
    [future, currentBalance, pastValue]
  );

  const [paymentStatus, setPaymentStatus] = useState('balance');

  const situations = {
    receipts: {
      title: 'Excelente',
      description: `Conseguirá pagar todas as dívidas mensais com o que receberá.`,
      color: '#368f42',
    },
    balance: {
      title: 'Estável',
      description: (
        <div>
          Conseguirá pagar suas dívidas, mas terá que usar{' '}
          {
            <strong style={{ color: '#c83126' }}>
              R${' '}
              {parseFloat(totalDebts - willReceive)
                .toFixed(2)
                .replace('.', ',')}
            </strong>
          }{' '}
          do seu saldo {future ? 'futuro' : 'atual'}.
        </div>
      ),
      color: '#368f42',
    },
    kept: {
      title: 'Instável',
      description: (
        <div>
          Conseguirá pagar suas dívidas, mas terá que usar{' '}
          {
            <strong style={{ color: '#c83126' }}>
              R${' '}
              {parseFloat(totalDebts - willReceive - actualBalance)
                .toFixed(2)
                .replace('.', ',')}
            </strong>
          }{' '}
          do que {future ? 'terá' : 'tem'} guardado.
        </div>
      ),
      color: 'orange',
    },
    noway: {
      title: 'Inviável',
      description: (
        <div>
          Com os débitos e saldos atuais, não conseguirá quitar as dívidas do
          mês. Faltará{' '}
          {
            <strong style={{ color: '#c83126' }}>
              R${' '}
              {parseFloat(
                totalDebts - willReceive - actualBalance - keptBalance
              )
                .toFixed(2)
                .replace('.', ',')}
            </strong>
          }{', '}
          mesmo usando todo o saldo guardado.
        </div>
      ),
      color: '#c83126',
    },
    pending: {
      title: 'Pendente',
      description: (
        <p style={{ margin: 0 }}>
          Adicione seus recebimentos e débitos do mês nas telas de{' '}
          <strong style={{ color: '#368f42' }}>ganhos</strong> e{' '}
          <strong style={{ color: '#c83126' }}>dívidas</strong> para começar a
          usar a Caderneta!
        </p>
      ),
      color: '#232C68',
    },
  };

  useEffect(() => {
    if (!willReceive && !totalDebts && !actualBalance) {
      setPaymentStatus('pending');
    } else if (willReceive >= totalDebts) {
      setPaymentStatus('receipts');
    } else if (willReceive + actualBalance >= totalDebts) {
      setPaymentStatus('balance');
    } else if (willReceive + actualBalance + keptBalance >= totalDebts) {
      setPaymentStatus('kept');
    } else {
      setPaymentStatus('noway');
    }
  }, [actualBalance, willReceive, keptBalance, totalDebts, loading]);

  return (
    <Container>
      {loading ? (
        <Spin size='large' style={{ marginTop: '15%', marginBottom: '15%' }} />
      ) : (
        <>
          <Title color={situations[paymentStatus].color}>SITUAÇÃO</Title>
          <Description>{situations[paymentStatus].description}</Description>
          <Situation color={situations[paymentStatus].color}>
            {situations[paymentStatus].title}
          </Situation>
        </>
      )}
    </Container>
  );
}
