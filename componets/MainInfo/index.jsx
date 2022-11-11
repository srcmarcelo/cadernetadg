/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  Balance,
  BalanceLabel,
  BalancesContainer,
  BalanceValue,
  Container,
  WarningContainer,
} from './styles';
import CurrencyFormat from 'react-currency-format';
import {
  getCurrentBalance,
  getFixedReceipts,
} from '../../containers/Income/redux/reducer';
import { useSelector } from 'react-redux';

export default function MainInfo() {
  const currentBalance = useSelector(getCurrentBalance);
  const fixedReceipts = useSelector(getFixedReceipts);

  const [willReceive, setWillReceive] = useState(0);

  useEffect(() => {
    let total = 0;
    fixedReceipts.forEach(({ value }, index) => {
      if (value) {
        index === 0 ? (total = value) : (total += value);
      }
    });
    setWillReceive(total);
  }, [fixedReceipts]);

  const RenderValue = ({ color, value }) => (
    <CurrencyFormat
      value={value}
      displayType={'text'}
      thousandSeparator='.'
      decimalSeparator=','
      fixedDecimalScale={true}
      decimalScale={2}
      prefix={'R$'}
      renderText={(textValue) => (
        <BalanceValue color={color}>{textValue}</BalanceValue>
      )}
    />
  );

  return (
    <Container>
      <BalancesContainer>
        <Balance>
          <BalanceLabel>Quanto você tem:</BalanceLabel>
          <RenderValue color='#368F42' value={currentBalance} />
        </Balance>
        <Balance>
          <BalanceLabel>Quanto receberá este mês:</BalanceLabel>
          <RenderValue color='#368F42' value={willReceive} />
        </Balance>
        <Balance>
          <BalanceLabel>Quanto você deve este mês:</BalanceLabel>
          <RenderValue color='#C83126' value={2456981} />
        </Balance>
      </BalancesContainer>
      <WarningContainer>Está tudo ok!</WarningContainer>
    </Container>
  );
}
