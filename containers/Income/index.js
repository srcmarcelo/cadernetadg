import React from 'react';
import FixedReceipts from '../../componets/IncomeCards/FixedReceipts';
import { Container } from './styles';

export default function Income(props) {
  return (
    <Container>
      <FixedReceipts />
    </Container>
  );
}
