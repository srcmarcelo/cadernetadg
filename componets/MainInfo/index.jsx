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
  getSyncing,
  getTotalDebtorsDebts,
  getTotalDebts,
  getWillReceive,
  setCurrentDebtorDependency,
  setMonthlyLoss,
  setTotalDebtorsDebts,
  setTotalDebts,
  setWillReceive,
} from '../../containers/Main/redux/reducer';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFixedDebts,
  getExtraDebts,
  getCreditCards,
} from '../../containers/Outcome/redux/reducer';
import { Skeleton } from 'antd';

export default function MainInfo({ dispatch, future, setPastValue }) {
  const actualBalance = useSelector(getCurrentBalance);
  const extraReceipts = useSelector(getExtraReceipts);
  const fixedReceipts = useSelector(getFixedReceipts);
  const fixedDebts = useSelector(getFixedDebts);
  const extraDebts = useSelector(getExtraDebts);
  const creditCards = useSelector(getCreditCards);
  const debtorsDebts = useSelector(getDebts);

  const willReceive = useSelector(getWillReceive);
  const totalDebts = useSelector(getTotalDebts);
  const totalDebtorsDebts = useSelector(getTotalDebtorsDebts);

  const syncing = useSelector(getSyncing);

  const [monthlySituation, setMonthlySituation] = useState('profit');
  const [generalSituation, setGeneralSituation] = useState('positive');

  const [debtorDependency, setDebtorDependency] = useState(false);
  const [loss, setLoss] = useState(false);

  const [pastBalance, setPastBalance] = useState(0);

  const monthlyBalance = {
    profit: {
      label: 'Lucro',
      color: '#368F42',
    },
    deficit: {
      label: 'Diferença',
      color: '#C83126',
    },
  };

  const generalBalance = {
    positive: {
      label: 'Restará',
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
    receipts.forEach(
      (
        {
          value,
          received,
          disabled,
          future_value,
          future_received,
          future_disabled,
          name,
        },
        index
      ) => {
        const hasFutureValue = future_value !== undefined;
        const hasFutureReceived = future_received !== undefined;
        const hasFutureDisabled = future_disabled !== undefined;

        const currentValue = future && hasFutureValue ? future_value : value;
        const currentReceived =
          future && hasFutureReceived ? future_received : received;
        const currentDisabled =
          future && hasFutureDisabled ? future_disabled : disabled;

        if (currentValue && !currentReceived && !currentDisabled) {
          index === 0 ? (total = currentValue) : (total += currentValue);
        }
      }
    );
    dispatch(setWillReceive(total));
  }, [fixedReceipts, extraReceipts, debtorsDebts, future]);

  useEffect(() => {
    let total = 0;
    const debts = [...fixedDebts, ...extraDebts, ...creditCards];
    debts.forEach(
      (
        { value, payed, disabled, future_value, future_payed, future_disabled },
        index
      ) => {
        const hasFutureValue = future_value !== undefined;
        const hasFuturePayed = future_payed !== undefined;
        const hasFutureDisabled = future_disabled !== undefined;

        const currentValue = future && hasFutureValue ? future_value : value;
        const currentPayed = future && hasFuturePayed ? future_payed : payed;
        const currentDisabled =
          future && hasFutureDisabled ? future_disabled : disabled;

        if (currentValue && !currentPayed && !currentDisabled) {
          index === 0 ? (total = currentValue) : (total += currentValue);
        }
      }
    );
    dispatch(setTotalDebts(total));
  }, [fixedDebts, extraDebts, creditCards, future]);

  useEffect(() => {
    let total = 0;
    debtorsDebts.forEach(({ value, disabled, future_disabled }, index) => {
      const hasFutureDisabled = future_disabled !== undefined;

      const currentDisabled =
        future && hasFutureDisabled ? future_disabled : disabled;

      if (value && !currentDisabled) {
        index === 0 ? (total = value) : (total += value);
      }
    });
    dispatch(setTotalDebtorsDebts(total));
  }, [debtorsDebts]);

  useEffect(() => {
    const currentBalance = future ? pastBalance : actualBalance;

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
  }, [totalDebts, willReceive, actualBalance, pastBalance]);

  useEffect(() => {
    const value =
      (willReceive - totalDebts + actualBalance);

    if (!future) {
      setPastValue(value);
      setPastBalance(value > 0 ? value : 0);
    }
  }, [future, willReceive, totalDebts, actualBalance, generalSituation]);

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

  const RenderBalance = ({ label, value, color, weight }) => (
    <Balance>
      <BalanceLabel weight={weight} color={color}>
        {label}
      </BalanceLabel>
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
      {syncing ? (
        <Skeleton active />
      ) : (
        <>
          <BalancesContainer>
            <RenderBalance
              color='#368F42'
              label={future ? 'Quanto terá:' : 'Quanto você tem agora:'}
              value={future ? pastBalance : actualBalance}
            />
            <RenderBalance
              color='#368F42'
              label={future ? 'Quanto receberá:' : 'Quanto ainda receberá:'}
              value={willReceive}
              weight='bold'
            />
            <RenderBalance
              color='#C83126'
              label={future ? 'Quanto deverá:' : 'Quanto ainda deve:'}
              value={totalDebts}
              weight='bold'
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
                (willReceive - totalDebts + (future ? pastBalance : actualBalance)) *
                (generalSituation === 'negative' ? -1 : 1)
              }
            />
          </WarningContainer>
        </>
      )}
    </Container>
  );
}
