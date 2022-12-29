import React from 'react';
import { Container, LinkText } from './styles';

export default function ProfileButton({ onClick }) {
  return (
    <Container>
      <LinkText onClick={() => onClick('profile')}>
        Perfil e Configurações
      </LinkText>
    </Container>
  );
}
