import React from 'react';
import CreditCards from '../../componets/OutcomeCards/CreditCards';
import FixedDebts from '../../componets/OutcomeCards/FixedDebts';
import ExtraDebts from '../../componets/OutcomeCards/ExtraDebts';
import { Container, Content } from './styles';

export default function Outcome() {
  return (
    <Container>
      <Content>
        <FixedDebts />
        <CreditCards />
        <ExtraDebts />
      </Content>
    </Container>
  );
}
