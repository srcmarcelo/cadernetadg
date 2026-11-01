import React from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';
import { useSelector } from 'react-redux';
import AlertsCard from '../../componets/CPCards/AlertsCard';
import BalanceCard from '../../componets/CPCards/BalanceCard';
import SituationCard from '../../componets/CPCards/SituationCard';
import { getSyncing } from '../Main/redux/reducer';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 24px;
`;

const CenterSpin = styled.div`
  width: 100%;
  padding: 64px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function ControlPanel() {
  const syncing = useSelector(getSyncing);

  if (syncing) {
    return (
      <CenterSpin className='panel-screen'>
        <Spin size='large' />
      </CenterSpin>
    );
  }

  return (
    <Wrapper className='panel-screen'>
      <BalanceCard />
      <SituationCard />
      <AlertsCard />
    </Wrapper>
  );
}
