import React from 'react';
import Debtors from '../../componets/IncomeCards/Debtors';
import ExtraReceipts from '../../componets/IncomeCards/ExtraReceipts';
import FixedReceipts from '../../componets/IncomeCards/FixedReceipts';
import { Container, Content } from './styles';

export default function Income({future}) {
  return (
    <Container>
      <Content>
        <FixedReceipts future={future} />
        <Debtors future={future} />
        <ExtraReceipts future={future} />
      </Content>
    </Container>
  );
}
