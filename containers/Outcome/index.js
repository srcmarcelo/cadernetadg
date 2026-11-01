import React from 'react';
import styled from 'styled-components';
import CreditCards from '../../componets/OutcomeCards/CreditCards';
import FixedDebts from '../../componets/OutcomeCards/FixedDebts';
import ExtraDebts from '../../componets/OutcomeCards/ExtraDebts';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 28px;
`;

export default function Outcome() {
  return (
    <Wrapper className='outcome-screen'>
      <FixedDebts />
      <CreditCards />
      <ExtraDebts />
    </Wrapper>
  );
}
