import React from 'react';
import CurrencyFormat from 'react-currency-format';
import { DisplayDebtValue, DisplayValue } from './styles';

export default function RenderValue({
  value,
  debt,
  color,
  fontSize,
  textAlign,
  className,
}) {
  return (
    <CurrencyFormat
      value={value}
      displayType={'text'}
      thousandSeparator='.'
      decimalSeparator=','
      fixedDecimalScale={true}
      decimalScale={2}
      prefix={'R$ '}
      renderText={(textValue) =>
        debt ? (
          <DisplayDebtValue className={className} color={color}>
            {textValue}
          </DisplayDebtValue>
        ) : (
          <DisplayValue
            className={className}
            color={color}
            fontSize={fontSize}
            textAlign={textAlign}
          >
            {textValue}
          </DisplayValue>
        )
      }
    />
  );
}
