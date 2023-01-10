/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  Balance,
  BalanceLabel,
  BalancesContainer,
  BalanceValue,
  CardContainer,
  Container,
  SituationContainer,
  SituationDescription,
  SituationTitle,
  WarningContainer,
} from './styles';
import CurrencyFormat from 'react-currency-format';
import {
  getFixedReceipts,
  getExtraReceipts,
  getDebts,
} from '../../containers/Income/redux/reducer';
import {
  getCurrentBalance,
  getKeptBalance,
  setCurrentDebtorDependency,
  setMonthlyLoss,
} from '../../containers/Main/redux/reducer';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFixedDebts,
  getExtraDebts,
  getCreditCards,
} from '../../containers/Outcome/redux/reducer';

export default function MainInfo({ dispatch }) {
  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);
  const extraReceipts = useSelector(getExtraReceipts);
  const fixedReceipts = useSelector(getFixedReceipts);
  const fixedDebts = useSelector(getFixedDebts);
  const extraDebts = useSelector(getExtraDebts);
  const creditCards = useSelector(getCreditCards);
  const debtorsDebts = useSelector(getDebts);

  const [willReceive, setWillReceive] = useState(0);
  const [totalDebts, setTotalDebts] = useState(0);
  const [totalDebtorsDebts, setTotalDebtorsDebts] = useState(0);

  const [monthlySituation, setMonthlySituation] = useState('profit');
  const [generalSituation, setGeneralSituation] = useState('positive');

  const [debtorDependency, setDebtorDependency] = useState(false);
  const [loss, setLoss] = useState(false);

  const monthlyBalance = {
    profit: {
      label: 'Lucro de',
      color: '#368F42',
    },
    deficit: {
      label: 'Déficit de',
      color: '#C83126',
    },
  };

  const generalBalance = {
    positive: {
      label: 'Novo saldo',
      color: '#368F42',
    },
    negative: {
      label: 'Faltará',
      color: '#C83126',
    },
  };

  const warningLabels = {
    debtorDependency: 'Dependência de devedores',
    loss: 'Saldo mensal negativo',
  };

  useEffect(() => {
    let total = 0;
    const receipts = [...fixedReceipts, ...extraReceipts, ...debtorsDebts];
    receipts.forEach(({ value, received, disabled }, index) => {
      if (value && !received && !disabled) {
        index === 0 ? (total = value) : (total += value);
      }
    });
    setWillReceive(total);
  }, [fixedReceipts, extraReceipts, debtorsDebts]);

  useEffect(() => {
    let total = 0;
    const debts = [...fixedDebts, ...extraDebts, ...creditCards];
    debts.forEach(({ value, payed, disabled }, index) => {
      if (value && !payed && !disabled) {
        index === 0 ? (total = value) : (total += value);
      }
    });
    setTotalDebts(total);
  }, [fixedDebts, extraDebts, creditCards]);

  useEffect(() => {
    let total = 0;
    debtorsDebts.forEach(({ value, disabled }, index) => {
      if (value && !disabled) {
        index === 0 ? (total = value) : (total += value);
      }
    });
    setTotalDebtorsDebts(total);
  }, [debtorsDebts]);

  useEffect(() => {
    if (willReceive - totalDebts < 0) {
      setMonthlySituation('deficit');
      handleSetLoss(true);
      if (totalDebtorsDebts > 0) {
        handleSetDebtorsDependency(true);
      } else handleSetDebtorsDependency(false);
    } else {
      setMonthlySituation('profit');
      handleSetLoss(false);
      if (willReceive + currentBalance - totalDebts - totalDebtorsDebts < 0) {
        handleSetDebtorsDependency(true);
      } else handleSetDebtorsDependency(false);
    }

    willReceive - totalDebts + currentBalance < 0
      ? setGeneralSituation('negative')
      : setGeneralSituation('positive');
  }, [totalDebts, willReceive, currentBalance]);

  const handleSetLoss = (value) => {
    setLoss(value);
    dispatch(setMonthlyLoss(value));
  };
  const handleSetDebtorsDependency = (value) => {
    setDebtorDependency(value);
    dispatch(setCurrentDebtorDependency(value));
  };

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
        <BalanceValue color={color} width={screen.width}>
          {textValue}
        </BalanceValue>
      )}
    />
  );

  const RenderBalance = ({ label, value, color }) => (
    <Balance>
      <BalanceLabel color={color}>{label}</BalanceLabel>
      <RenderValue color={color} value={value} />
    </Balance>
  );

  const RenderBalanceCard = ({ label, value, color }) => (
    <CardContainer>
      <SituationTitle color={color} width={screen.width}>
        {label}
      </SituationTitle>
      <RenderValue color={color} value={value} />
    </CardContainer>
  );

  const RenderWarning = ({ debtorDependency, loss }) => {
    const warnings = [{ debtorDependency: debtorDependency }, { loss: loss }];
    const filteredWarnings = warnings.filter(
      (obj) => Object.values(obj)[0] === true
    );
    const alertAmount = filteredWarnings.length;
    if (_.isEmpty(filteredWarnings)) return;
    return (
      <SituationContainer>
        <SituationTitle color='orange'>
          {alertAmount} {alertAmount > 1 ? 'alertas' : 'alerta'}
        </SituationTitle>
        <SituationDescription width={screen.width} color='darkorange'>
          {alertAmount > 1
            ? 'Veja detalhes no Painel'
            : warningLabels[Object.keys(filteredWarnings[0])[0]]}
        </SituationDescription>
      </SituationContainer>
    );
  };

  return (
    <Container>
      <BalancesContainer>
        <RenderBalance
          color='#368F42'
          label='Quanto você tem agora:'
          value={currentBalance}
        />
        <RenderBalance
          color='#368F42'
          label='Quanto ainda receberá:'
          value={willReceive}
        />
        <RenderBalance
          color='#C83126'
          label='Quanto ainda deve:'
          value={totalDebts}
        />
      </BalancesContainer>
      <WarningContainer>
        <RenderBalanceCard
          label={monthlyBalance[monthlySituation].label}
          color={monthlyBalance[monthlySituation].color}
          value={
            (willReceive - totalDebts) *
            (monthlySituation === 'deficit' ? -1 : 1)
          }
        />
        <RenderWarning debtorDependency={debtorDependency} loss={loss} />
        <RenderBalanceCard
          label={generalBalance[generalSituation].label}
          color={generalBalance[generalSituation].color}
          value={
            (willReceive - totalDebts + currentBalance) *
            (generalSituation === 'negative' ? -1 : 1)
          }
        />
      </WarningContainer>
    </Container>
  );
}
