import React from 'react';
import AlertsCard from '../../componets/CPCards/AlertsCard';
import BalanceCard from '../../componets/CPCards/BalanceCard';
import { Container, Content } from './styles';

export default function ControlPanel() {
  return (
    <Container>
      <Content>
        <BalanceCard />
        <AlertsCard />
      </Content>
    </Container>
  );
}
