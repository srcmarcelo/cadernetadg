import React from 'react';
import {Container, Title, Message} from './styles';

export default function Empty({title, message}) {
  return (
    <Container>
      {title && <Title>{title}</Title>}
      {message && <Message>{message}</Message>}
    </Container>
  );
}
