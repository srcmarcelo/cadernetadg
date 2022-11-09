import React from 'react';
import _ from 'lodash';
import {
  Container,
  Head,
  Label,
  AddButton,
  AddButtonText,
  ItemContainer,
  ValueContainer,
  TitleContainer,
  Title,
  Value,
  ButtonsContainer,
} from './styles';

import { useDispatch, useSelector } from 'react-redux';
import { getFixedReceipts } from '../../../containers/Income/redux/reducer';
import Empty from '../../Empty';
import { dispatchCreateFixedReceipts } from '../../../containers/Income/redux';
import { Button } from 'antd';

export default function FixedReceipts() {
  const dispatch = useDispatch();
  const fixedReceipts = useSelector(getFixedReceipts);
  const hasReceipts = !_.isEmpty(fixedReceipts);

  //   const handleChangeCurrentBalance = (e) => {
  //     const value = e.target.value.slice(3).replace('.', '').replace(',', '.');
  //     dispatchSetFixedReceipts(dispatch, parseFloat(value));
  //   };

  const handleCreateReceipt = () => {
    const newReceipt = {
      id: hasReceipts ? fixedReceipts[fixedReceipts.length - 1].id + 1 : 1,
      value: 0,
      name: '',
    };
    const newReceipts = [...fixedReceipts, newReceipt];
    dispatchCreateFixedReceipts(dispatch, newReceipts);
  };

  const RenderItem = ({ item }) => {
    return (
      <ItemContainer>
        <ValueContainer>
          <TitleContainer>
            <Title placeholder='Exemplo: Salário' />
          </TitleContainer>
          <Value
            onChangeEvent={() => {}}
            prefix='R$ '
            decimalSeparator=','
            thousandSeparator='.'
            precision={2}
            value={item.value}
          />
        </ValueContainer>
        <ButtonsContainer>
            <Button>Teste</Button>
            <Button>Teste</Button>
        </ButtonsContainer>
      </ItemContainer>
    );
  };

  return (
    <Container items={fixedReceipts.length}>
      <Head>
        <Label>Recebimentos Fixos</Label>
        <AddButton onClick={handleCreateReceipt}>
          <AddButtonText>Adicionar</AddButtonText>
        </AddButton>
      </Head>
      {!hasReceipts ? (
        <Empty
          title='Nenhum recebimento fixo cadastrado'
          message='Clique em adicionar para adicionar recebimento'
        />
      ) : (
        fixedReceipts.map((item) => <RenderItem key={item.id} item={item} />)
      )}
    </Container>
  );
}
