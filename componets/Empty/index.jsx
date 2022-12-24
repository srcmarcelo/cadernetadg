import React from 'react';
import {Container, Title, Message} from './styles';

export default function Empty({title, message, sizeAdjust}) {
  return (
    <Container>
      {title && <Title sizeAdjust={sizeAdjust}>{title}</Title>}
      {message && <Message sizeAdjust={sizeAdjust}>{message}</Message>}
    </Container>
  );
}
