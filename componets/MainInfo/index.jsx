import React from 'react';
import {
  Balance,
  BalanceLabel,
  BalancesContainer,
  BalanceValue,
  Container,
  WarningContainer,
} from './styles';
import CurrencyFormat from 'react-currency-format';
import { getCurrentBalance } from '../../containers/Income/redux/reducer';
import { useSelector } from 'react-redux';

export default function MainInfo() {
  const currentBalance = useSelector(getCurrentBalance);

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
          <RenderValue color='#368F42' value={2456981} />
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
