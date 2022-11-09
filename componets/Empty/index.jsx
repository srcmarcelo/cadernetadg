import React from 'react';
import {Container, Title, Message} from './styles';

export default function Empty({title, message}) {
  return (
    <Container>
      <Title>{title}</Title>
      <Message>{message}</Message>
    </Container>
  );
}
