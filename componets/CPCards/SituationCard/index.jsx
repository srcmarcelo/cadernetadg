import React, { useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getCurrentBalance,
  getKeptBalance,
  getTotalDebts,
  getWillReceive,
} from '../../../containers/Main/redux/reducer';
import { Container, Description, Situation, Title } from './styles';

export default function SituationCard() {
  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);
  const willReceive = useSelector(getWillReceive);
  const totalDebts = useSelector(getTotalDebts);

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
          do seu saldo atual.
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
              {parseFloat(totalDebts - willReceive - currentBalance)
                .toFixed(2)
                .replace('.', ',')}
            </strong>
          }{' '}
          do que tem guardado.
        </div>
      ),
      color: 'orange',
    },
    noway: {
      title: 'Inviável',
      description:
        'Com os débitos e saldos atuais, não conseguirá quitar as dívidas do mês.',
      color: '#c83126',
    },
    pending: {
      title: 'Pendente',
      description:
        'Adicione seus recebimentos e dívidas do mês nas telas de saldos e debitos para começar a usar a Caderneta!',
      color: '#232C68',
    },
  };

  useEffect(() => {
    if (!willReceive && !totalDebts && !currentBalance) {
      setPaymentStatus('pending');
    } else if (willReceive >= totalDebts) {
      setPaymentStatus('receipts');
    } else if (willReceive + currentBalance >= totalDebts) {
      setPaymentStatus('balance');
    } else if (willReceive + currentBalance + keptBalance >= totalDebts) {
      setPaymentStatus('kept');
    } else {
      setPaymentStatus('noway');
    }
  }, [currentBalance, willReceive, keptBalance, totalDebts]);

  return (
    <Container>
      <Title color={situations[paymentStatus].color}>SITUAÇÃO</Title>
      <Description>{situations[paymentStatus].description}</Description>
      <Situation color={situations[paymentStatus].color}>
        {situations[paymentStatus].title}
      </Situation>
    </Container>
  );
}
