import React from 'react';
import FixedDebts from '../../componets/OutcomeCards/FixedDebts';
import OtherDebts from '../../componets/OutcomeCards/OtherDebts';
import { Container } from './styles';

export default function Outcome() {
  return (
    <Container>
      <FixedDebts />
      <OtherDebts />
    </Container>
  );
}
