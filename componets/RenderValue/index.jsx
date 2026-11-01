import React from 'react';
import { formatBRL } from '../../utils/currency';
import { DisplayDebtValue, DisplayValue } from './styles';

export default function RenderValue({
  value,
  debt,
  color,
  fontSize,
  textAlign,
  className,
}) {
  const formatted = formatBRL(value);

  if (debt) {
    return (
      <DisplayDebtValue className={className} color={color}>
        {formatted}
      </DisplayDebtValue>
    );
  }

  return (
    <DisplayValue
      className={className}
      color={color}
      fontSize={fontSize}
      textAlign={textAlign}
    >
      {formatted}
    </DisplayValue>
  );
}
