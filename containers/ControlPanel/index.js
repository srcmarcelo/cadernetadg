import React from 'react';
import BalanceCard from '../../componets/CPCards/BalanceCard';
import { Container, Content } from './styles';

export default function ControlPanel() {
  return (
    <Container>
      <Content>
        <BalanceCard />
      </Content>
    </Container>
  );
}
