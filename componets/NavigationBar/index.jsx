import React from 'react';
import { NavigationButton, Container } from './styles';

export default function NavigationBar({ onClick, currentTab }) {
  const colors = {
    income: '#368F42',
    panel: '#232C68',
    outcome: '#C83126',
    profile: 'blue',
  };

  const names = {
    income: 'Saldos',
    panel: 'Painel',
    outcome: 'Débitos',
  };

  const RenderButton = ({ label }) => (
    <NavigationButton
      color={colors[label]}
      onClick={() => onClick(label)}
      selected={currentTab === label}
    >
      {names[label]}
    </NavigationButton>
  );

  return (
    <Container color={colors[currentTab]}>
      <RenderButton label='income' />
      <RenderButton label='panel' />
      <RenderButton label='outcome' />
    </Container>
  );
}
