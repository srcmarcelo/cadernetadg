import React from 'react';
import Debtors from '../../componets/IncomeCards/Debtors';
import ExtraReceipts from '../../componets/IncomeCards/ExtraReceipts';
import FixedReceipts from '../../componets/IncomeCards/FixedReceipts';
import { Container, Content } from './styles';

export default function Income(props) {
  return (
    <Container>
      <Content>
        <FixedReceipts />
        <Debtors />
        <ExtraReceipts />
      </Content>
    </Container>
  );
}
