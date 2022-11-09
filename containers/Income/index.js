import React from 'react';
import BalanceCard from '../../componets/IncomeCards/BalanceCard';
import FixedReceipts from '../../componets/IncomeCards/FixedReceipts';
import { Container } from './styles';

export default function Income(props) {
  return (
    <Container>
      <BalanceCard />
      <FixedReceipts />
    </Container>
  );
}
