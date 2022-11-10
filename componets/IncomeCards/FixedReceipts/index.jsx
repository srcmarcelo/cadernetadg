import React, { useState } from 'react';
import _ from 'lodash';
import {
  Container,
  Head,
  Label,
  AddButton,
  ItemContainer,
  ValueContainer,
  TitleContainer,
  Title,
  Value,
  ButtonsContainer,
  ActionButton,
  FormContainer,
  TitleInput,
  ItemContent,
  DisplayValue,
} from './styles';

import { useDispatch, useSelector } from 'react-redux';
import { getFixedReceipts } from '../../../containers/Income/redux/reducer';
import Empty from '../../Empty';
import {
  dispatchCreateFixedReceipts,
  dispatchEditFixedReceipts,
} from '../../../containers/Income/redux';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Form } from 'antd';
import CurrencyFormat from 'react-currency-format';

export default function FixedReceipts() {
  const dispatch = useDispatch();
  const fixedReceipts = useSelector(getFixedReceipts);
  const hasReceipts = !_.isEmpty(fixedReceipts);

  const [currentIdEditing, setCurentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);

  const handleCreateReceipt = () => {
    const id = hasReceipts ? fixedReceipts[fixedReceipts.length - 1].id + 1 : 1;
    const newReceipt = {
      id: id,
      value: undefined,
      name: '',
    };
    const newReceipts = [...fixedReceipts, newReceipt];
    dispatchCreateFixedReceipts(dispatch, newReceipts);
    setCurentIdEditing(id);
  };

  const handleEditReceipt = async (values, id) => {
    const index = fixedReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(fixedReceipts);
    newReceipts[index] = {
      id: id,
      value: parseFloat(
        values.value.slice(3).replace('.', '').replace(',', '.')
      ),
      name: values.name,
    };
    dispatchEditFixedReceipts(dispatch, newReceipts);
    setCurentIdEditing(null);
    setErrorFinish(false);
  };

  const RenderValue = ({ value }) => (
    <CurrencyFormat
      value={value}
      displayType={'text'}
      thousandSeparator='.'
      decimalSeparator=','
      fixedDecimalScale={true}
      decimalScale={2}
      prefix={'R$ '}
      renderText={(textValue) => <DisplayValue>{textValue}</DisplayValue>}
    />
  );

  const RenderForm = ({ item }) => (
    <FormContainer
      onFinish={(values) => handleEditReceipt(values, item.id)}
      initialValues={{ ...item }}
      onFinishFailed={() => setErrorFinish(true)}
    >
      <ValueContainer>
        <Form.Item
          style={{ margin: 0 }}
          name='name'
          rules={[
            {
              required: true,
              message: 'Digite um nome para identificacar o recebimento.',
            },
          ]}
        >
          <TitleContainer>
            <TitleInput
              key={`name_${item.id}`}
              id={`name_${item.id}`}
              placeholder='Exemplo: Salário'
            />
          </TitleContainer>
        </Form.Item>
        <Form.Item
          style={{ margin: 0 }}
          name='value'
          rules={[
            {
              required: true,
              message: 'Digite o valor do recebimento.',
            },
          ]}
        >
          <Value
            prefix='R$ '
            key={`value_${item.id}`}
            decimalSeparator=','
            thousandSeparator='.'
            precision={2}
          />
        </Form.Item>
      </ValueContainer>
      <ButtonsContainer>
        <ActionButton color='green' htmlType='submit'>
          <CheckOutlined />
        </ActionButton>
        <ActionButton color='red'>
          <CloseOutlined />
        </ActionButton>
      </ButtonsContainer>
    </FormContainer>
  );

  const RenderItemContent = ({ item }) => (
    <ItemContent>
      <ValueContainer>
        <Title>{item.name.toUpperCase()}</Title>
        <RenderValue value={item.value} />
      </ValueContainer>
      <ButtonsContainer>
        <ActionButton color='orange' disabled={currentIdEditing}>
          <EditOutlined />
        </ActionButton>
        <ActionButton color='red' disabled={currentIdEditing}>
          <CloseOutlined />
        </ActionButton>
      </ButtonsContainer>
    </ItemContent>
  );

  const RenderItem = ({ item }) => {
    return (
      <ItemContainer>
        {item.id === currentIdEditing ? (
          <RenderForm item={item} />
        ) : (
          <RenderItemContent item={item} />
        )}
      </ItemContainer>
    );
  };

  return (
    <Container items={fixedReceipts.length} error={errorFinish ? 20 : 0}>
      <Head>
        <Label>Recebimentos Fixos</Label>
        <AddButton onClick={handleCreateReceipt} disabled={currentIdEditing}>
          <PlusOutlined />
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
