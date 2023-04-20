import React from 'react';
import { LinkText } from './styles';
import { QuestionCircleOutlined } from '@ant-design/icons';

export default function CardTourButton({ onClick, disabled }) {
  return (
    <LinkText onClick={onClick} aria-disabled={disabled}>
      <QuestionCircleOutlined
        style={{ fontSize: '1.4rem' }}
      />
    </LinkText>
  );
}
