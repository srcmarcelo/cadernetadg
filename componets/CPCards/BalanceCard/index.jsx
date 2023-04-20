/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  dispatchSetCurrentBalance,
  dispatchSetKeptBalance,
} from '../../../containers/Main/redux';
import {
  getCurrentBalance,
  getKeptBalance,
} from '../../../containers/Main/redux/reducer';
import { Container, ValueContainer, Title, Value, Header } from './styles';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';
import { debounce } from 'lodash';
import RenderValue from '../../RenderValue';
import CardTourButton from '../../CardTourButton';
import ReactJoyride from 'react-joyride';
import {
  balanceCardTourSteps,
  futureBalanceCardTourSteps,
} from '../../../utils/toursSteps/balanceCardTour';

export default function BalanceCard({ future, pastValue }) {
  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const [tour, setTour] = useState(false);

  const debouncedSaveCurrent = useCallback(
    debounce(
      (nextValue) =>
        dispatchSetCurrentBalance(dispatch, nextValue, supabase, user),
      1000
    ),
    []
  );

  const debouncedSaveKept = useCallback(
    debounce(
      (nextValue) =>
        dispatchSetKeptBalance(dispatch, nextValue, supabase, user),
      1000
    ),
    []
  );

  const handleChangeCurrentBalance = (e) => {
    const value = e.target.value.slice(3).replace('.', '').replace(',', '.');
    debouncedSaveCurrent(parseFloat(value));
  };

  const handleChangeKeptBalance = (e) => {
    const value = e.target.value.slice(3).replace('.', '').replace(',', '.');
    debouncedSaveKept(parseFloat(value));
  };

  return (
    <Container className='balanceCard'>
      <ReactJoyride
        steps={future ? futureBalanceCardTourSteps : balanceCardTourSteps}
        run={tour}
        continuous={true}
        showSkipButton={true}
        disableScrolling={true}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          open: 'Abrir legenda',
          skip: 'Pular guia',
        }}
        callback={({ index, action }) => {
          if (action === 'reset') setTour(false);
        }}
      />
      <ValueContainer>
        <Header>
          <Title>{future ? 'Saldo futuro:' : 'Saldo atual:'}</Title>
          <CardTourButton onClick={() => setTour(true)} />
        </Header>
        {future ? (
          <RenderValue
            value={pastValue > 0 ? pastValue : 0}
            color='green'
            fontSize='28px'
            textAlign='flex-start'
            className='futureCurrentBalance'
          />
        ) : (
          <Value
            onChangeEvent={handleChangeCurrentBalance}
            prefix='R$ '
            decimalSeparator=','
            thousandSeparator='.'
            precision={2}
            value={currentBalance}
            className='currentBalanceInput'
          />
        )}
      </ValueContainer>
      <ValueContainer>
        <Title size={'16px'}>Guardado:</Title>
        {future ? (
          <RenderValue
            value={
              pastValue > 0
                ? keptBalance
                : keptBalance + pastValue > 0
                ? keptBalance + pastValue
                : 0
            }
            color='green'
            fontSize='18px'
            textAlign='flex-start'
            className='futureKeptBalance'
          />
        ) : (
          <Value
            onChangeEvent={handleChangeKeptBalance}
            prefix='R$ '
            decimalSeparator=','
            thousandSeparator='.'
            precision={2}
            size='18px'
            value={keptBalance}
            className='keptBalanceInput'
          />
        )}
      </ValueContainer>
    </Container>
  );
}
