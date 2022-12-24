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
  getFixedReceipts,
  getExtraReceipts
} from '../../containers/Income/redux/reducer';
import { getCurrentBalance } from '../../containers/Main/redux/reducer';
import { useSelector } from 'react-redux';
import { getFixedDebts, getExtraDebts, getCreditCards } from '../../containers/Outcome/redux/reducer';

export default function MainInfo() {
  const currentBalance = useSelector(getCurrentBalance);
  const extraReceipts = useSelector(getExtraReceipts);
  const fixedReceipts = useSelector(getFixedReceipts);
  const fixedDebts = useSelector(getFixedDebts);
  const extraDebts = useSelector(getExtraDebts);
  const creditCards = useSelector(getCreditCards);

  const [willReceive, setWillReceive] = useState(0);
  const [totalDebts, setTotalDebts] = useState(0);

  useEffect(() => {
    let total = 0;
    const receipts = [...fixedReceipts, ...extraReceipts];
    receipts.forEach(({ value, received }, index) => {
      if (value && !received) {
        index === 0 ? (total = value) : (total += value);
      }
    });
    setWillReceive(total);
  }, [fixedReceipts, extraReceipts]);

  useEffect(() => {
    let total = 0;
    const debts = [...fixedDebts, ...extraDebts, ...creditCards];
    debts.forEach(({ value, payed }, index) => {
      if (value && !payed) {
        index === 0 ? (total = value) : (total += value);
      }
    });
    setTotalDebts(total);
  }, [fixedDebts, extraDebts, creditCards]);

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
          <RenderValue color='#C83126' value={totalDebts} />
        </Balance>
      </BalancesContainer>
      <WarningContainer>Está tudo ok!</WarningContainer>
    </Container>
  );
}
