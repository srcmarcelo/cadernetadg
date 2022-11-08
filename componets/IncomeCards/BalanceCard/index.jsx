import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dispatchSetCurrentBalance } from '../../../containers/Income/redux';
import { getCurrentBalance } from '../../../containers/Income/redux/reducer';
import { Container, ValueContainer, Title, Value } from './styles';

export default function BalanceCard() {
  const currentBalance = useSelector(getCurrentBalance);
  const dispatch = useDispatch();

  const handleChangeCurrentBalance = (e) => {
    const value = e.target.value.slice(3).replace('.', '').replace(',', '.');
    dispatchSetCurrentBalance(dispatch, parseFloat(value));
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
          prefix='R$ '
          decimalSeparator=','
          thousandSeparator='.'
          precision={2}
          size='18px'
        />
      </ValueContainer>
    </Container>
  );
}
