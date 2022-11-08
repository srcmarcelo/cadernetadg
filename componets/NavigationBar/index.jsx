import React from 'react';
import { NavigationButton, ButtonsContainer, Container } from './styles';

export default function NavigationBar({onClick}) {
  return (
    <Container>
      <ButtonsContainer>
        <NavigationButton color='#368F42' onClick={() => onClick('income')}>Saldos</NavigationButton>
        <NavigationButton color='#232C68' onClick={() => onClick('panel')}>Painel</NavigationButton>
        <NavigationButton color='#C83126' onClick={() => onClick('outcome')}>Débitos</NavigationButton>
      </ButtonsContainer>
    </Container>
  );
}
