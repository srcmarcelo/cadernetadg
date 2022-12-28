import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dispatchSetCurrentBalance, dispatchSetKeptBalance } from '../../../containers/Main/redux';
import { getCurrentBalance, getKeptBalance } from '../../../containers/Main/redux/reducer';
import { Container, ValueContainer, Title, Value } from './styles';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function BalanceCard() {
  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const handleChangeCurrentBalance = (e) => {
    const value = e.target.value.slice(3).replace('.', '').replace(',', '.');
    dispatchSetCurrentBalance(dispatch, parseFloat(value), supabase, user);
  };

  const handleChangeKeptBalance = (e) => {
    const value = e.target.value.slice(3).replace('.', '').replace(',', '.');
    dispatchSetKeptBalance(dispatch, parseFloat(value), supabase, user);
  };

  return (
    <Container>
      <ValueContainer>
        <Title>Saldo Atual:</Title>
        <Value
          onChangeEvent={handleChangeCurrentBalance}
          prefix='R$ '
          decimalSeparator=','
          thousandSeparator='.'
          precision={2}
          value={currentBalance}
        />
      </ValueContainer>
      <ValueContainer>
        <Title size={'16px'}>Guardado:</Title>
        <Value
          onChangeEvent={handleChangeKeptBalance}
          prefix='R$ '
          decimalSeparator=','
          thousandSeparator='.'
          precision={2}
          size='18px'
          value={keptBalance}
        />
      </ValueContainer>
    </Container>
  );
}
