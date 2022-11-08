import React from 'react';
import BalanceCard from '../../componets/IncomeCards/BalanceCard';
import { Container } from './styles';

export default function Income(props) {
  return (
    <Container>
      <BalanceCard {...props} />
    </Container>
  );
}
