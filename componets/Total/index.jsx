import React from 'react';
import RenderValue from '../RenderValue';
import { roundMoney } from '../../utils/currency';
import { TotalContainer, TotalLabel } from './styles';

/**
 * Displays total pending amount for resolved monthly items (or raw legacy items).
 */
export default function Total({
  array = [],
  totalValue,
  label = 'Total pendente no mês:',
  color,
  className,
}) {
  let computed = 0;

  if (typeof totalValue === 'number') {
    computed = roundMoney(totalValue);
  } else {
    array.forEach((item) => {
      const val =
        item.effectiveValue !== undefined
          ? Number(item.effectiveValue || 0)
          : Number(item.value || 0);
      const isPaid = Boolean(
        item.effectivePaid ?? item.effectiveReceived ?? item.payed ?? item.received
      );
      const isDisabled = Boolean(item.effectiveDisabled ?? item.disabled);

      if (val > 0 && !isPaid && !isDisabled) {
        computed += val;
      }
    });
    computed = roundMoney(computed);
  }

  return (
    <TotalContainer color={color} className={className}>
      <TotalLabel>{label}</TotalLabel>
      <div>
        <RenderValue value={computed} color='#fff' fontSize='1.15rem' />
      </div>
    </TotalContainer>
  );
}
