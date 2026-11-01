import React from 'react';
import styled from 'styled-components';
import Debtors from '../../componets/IncomeCards/Debtors';
import ExtraReceipts from '../../componets/IncomeCards/ExtraReceipts';
import FixedReceipts from '../../componets/IncomeCards/FixedReceipts';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 28px;
`;

export default function Income() {
  return (
    <Wrapper className='income-screen'>
      <FixedReceipts />
      <Debtors />
      <ExtraReceipts />
    </Wrapper>
  );
}
