import React from 'react';
import RenderValue from '../RenderValue';
import { TotalContainer, TotalLabel } from './styles';

export default function Total({ array, color, future }) {
  let total = 0;
  array.forEach((item, index) => {
    const hasFutureValue = item.future_value !== undefined;
    const hasFutureReceived = item.future_received !== undefined;
    const hasFutureDisabled = item.future_disabled !== undefined;
    const hasFuturePayed = item.future_payed !== undefined;

    const currentValue =
      future && hasFutureValue ? item.future_value : item.value;
    const currentReceived =
      future && hasFutureReceived ? item.future_received : item.received;
    const currentDisabled =
      future && hasFutureDisabled ? item.future_disabled : item.disabled;
    const currentPayed =
      future && hasFuturePayed ? item.future_payed : item.payed;

    if (currentValue && !(currentPayed || currentReceived || currentDisabled)) {
      if (index === 0) total = currentValue;
      else total += currentValue;
    }
  });

  return (
    <TotalContainer color={color}>
      <TotalLabel>Valor total:</TotalLabel>
      <div>
        <RenderValue value={total} color='#fff' fontSize='1.3rem' />
      </div>
    </TotalContainer>
  );
}
