import React from 'react';
import CreditCards from '../../componets/OutcomeCards/CreditCards';
import FixedDebts from '../../componets/OutcomeCards/FixedDebts';
import ExtraDebts from '../../componets/OutcomeCards/ExtraDebts';
import { Container, Content } from './styles';

export default function Outcome({ future }) {
  return (
    <Container className='outcome-screen'>
      <Content>
        <FixedDebts future={future} />
        <CreditCards future={future} />
        <ExtraDebts future={future} />
      </Content>
    </Container>
  );
}
