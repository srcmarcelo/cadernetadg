import { Spin } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import AlertsCard from '../../componets/CPCards/AlertsCard';
import BalanceCard from '../../componets/CPCards/BalanceCard';
import SituationCard from '../../componets/CPCards/SituationCard';
import { getSyncing } from '../Main/redux/reducer';
import { Container, Content } from './styles';

export default function ControlPanel({ future, pastValue }) {
  const syncing = useSelector(getSyncing);

  return (
    <Container>
      {syncing ? (
        <Spin size='large' style={{marginTop: '50%'}} />
      ) : (
        <Content>
          <BalanceCard future={future} pastValue={pastValue} />
          <SituationCard future={future} />
          <AlertsCard />
        </Content>
      )}
    </Container>
  );
}
