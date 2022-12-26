import React from 'react';
import { Container } from './styles';

export default function ProfileButton({onClick}) {
  return (
    <Container>
      <a onClick={() => onClick('profile')}>Perfil e Configurações</a>
    </Container>
  );
}
