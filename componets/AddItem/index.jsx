import React from 'react';
import { AddButton } from './styles';
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default function AddItem({ onClick, disabled, style }) {
  return (
    <AddButton onClick={onClick} hide={disabled} style={{ ...style }}>
      <PlusOutlined />
    </AddButton>
  );
}
