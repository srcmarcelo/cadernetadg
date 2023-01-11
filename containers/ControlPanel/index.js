import React from 'react';
import AlertsCard from '../../componets/CPCards/AlertsCard';
import BalanceCard from '../../componets/CPCards/BalanceCard';
import SituationCard from '../../componets/CPCards/SituationCard';
import { Container, Content } from './styles';

export default function ControlPanel() {
  return (
    <Container>
      <Content>
        <BalanceCard />
        <SituationCard />
        <AlertsCard />
      </Content>
    </Container>
  );
}
