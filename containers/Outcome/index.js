import React from 'react';
import CreditCards from '../../componets/OutcomeCards/CreditCards';
import FixedDebts from '../../componets/OutcomeCards/FixedDebts';
import ExtraDebts from '../../componets/OutcomeCards/ExtraDebts';
import { Container } from './styles';

export default function Outcome() {
  return (
    <Container>
      <FixedDebts />
      <CreditCards />
      <ExtraDebts />
    </Container>
  );
}
