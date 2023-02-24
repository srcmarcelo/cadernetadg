/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  dispatchSetCurrentBalance,
  dispatchSetKeptBalance,
} from '../../../containers/Main/redux';
import {
  getCurrentBalance,
  getKeptBalance,
} from '../../../containers/Main/redux/reducer';
import { Container, ValueContainer, Title, Value } from './styles';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';
import { debounce } from 'lodash';
import RenderValue from '../../RenderValue';

export default function BalanceCard({ future, pastValue }) {
  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

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
    <Container>
      <ValueContainer>
        <Title>{future ? 'Saldo futuro:' : 'Saldo atual:'}</Title>
        {future ? (
          <RenderValue
            value={pastValue > 0 ? pastValue : 0}
            color='green'
            fontSize='28px'
            textAlign='flex-start'
          />
        ) : (
          <Value
            onChangeEvent={handleChangeCurrentBalance}
            prefix='R$ '
            decimalSeparator=','
            thousandSeparator='.'
            precision={2}
            value={currentBalance}
          />
        )}
      </ValueContainer>
      <ValueContainer>
        <Title size={'16px'}>Guardado:</Title>
        {future ? (
          <RenderValue
            value={pastValue > 0 ? keptBalance : keptBalance + pastValue}
            color='green'
            fontSize='18px'
            textAlign='flex-start'
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
          />
        )}
      </ValueContainer>
    </Container>
  );
}
