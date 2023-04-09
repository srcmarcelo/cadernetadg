import React from 'react';
import {Container, Title, Message, InitiateButton} from './styles';

export default function Empty({title, onClick, sizeAdjust}) {
  return (
    <Container>
      {title && <Title sizeAdjust={sizeAdjust}>{title}</Title>}
      <InitiateButton onClick={onClick}>Adicionar</InitiateButton>
    </Container>
  );
}
