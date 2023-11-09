import React from 'react';
import { Container, PulseImage } from './styles';

export default function LoadingScreen() {
  return (
    <Container>
      <PulseImage
        src='/logo.png'
        width={125}
        height={74}
        alt='Logo do Caderneta Digital'
      />
    </Container>
  );
}
