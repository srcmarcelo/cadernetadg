import React from 'react';
import Debtors from '../../componets/IncomeCards/Debtors';
import ExtraReceipts from '../../componets/IncomeCards/ExtraReceipts';
import FixedReceipts from '../../componets/IncomeCards/FixedReceipts';
import { Container } from './styles';

export default function Income(props) {
  return (
    <Container>
      <FixedReceipts />
      <Debtors />
      <ExtraReceipts />
    </Container>
  );
}
