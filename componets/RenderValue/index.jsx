import React from 'react';
import CurrencyFormat from 'react-currency-format';
import { DisplayDebtValue, DisplayValue } from './styles';

export default function RenderValue({ value, debt, color, fontSize, textAlign }) {
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
          <DisplayDebtValue color={color}>{textValue}</DisplayDebtValue>
        ) : (
          <DisplayValue color={color} fontSize={fontSize} textAlign={textAlign}>
            {textValue}
          </DisplayValue>
        )
      }
    />
  );
}
