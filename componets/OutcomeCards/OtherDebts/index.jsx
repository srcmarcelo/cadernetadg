import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  PlusOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { Form, Modal } from 'antd';
import React, { useState } from 'react';
import CurrencyFormat from 'react-currency-format';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchEditOtherDebts } from '../../../containers/Outcome/redux';
import { getOtherDebts } from '../../../containers/Outcome/redux/reducer';
import Empty from '../../Empty';
import {
  Container,
  Head,
  Label,
  AddButton,
  ItemContainer,
  ValueContainer,
  Title,
  Value,
  ButtonsContainer,
  ActionButton,
  FormContainer,
  TitleInput,
  ItemContent,
  DisplayValue,
  ConfirmButton,
} from '../FixedDebts/styles';

export default function OtherDebts() {
  const dispatch = useDispatch();
  const otherDebts = useSelector(getOtherDebts);
  const hasDebts = !_.isEmpty(otherDebts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateDebt = () => {
    const id = hasDebts ? otherDebts[otherDebts.length - 1].id + 1 : 1;
    const newDebt = {
      id: id,
      value: undefined,
      name: '',
    };
    const newDebts = [...otherDebts, newDebt];
    dispatchEditOtherDebts(dispatch, newDebts);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditDebt = async (values, id) => {
    const index = otherDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(otherDebts);
    const debtValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newDebts[index] = {
      id: id,
      value: debtValue,
      name: values.name,
    };
    dispatchEditOtherDebts(dispatch, newDebts);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteDebt = async (id) => {
    const index = otherDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(otherDebts);
    newDebts.splice(index, 1);
    dispatchEditOtherDebts(dispatch, newDebts);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const RenderValue = ({ value }) => (
    <CurrencyFormat
      value={value}
      displayType={'text'}
      thousandSeparator='.'
      decimalSeparator=','
      otherDecimalScale={true}
      decimalScale={2}
      prefix={'R$ '}
      renderText={(textValue) => <DisplayValue>{textValue}</DisplayValue>}
    />
  );

  const RenderForm = ({ item }) => (
    <FormContainer
      onFinish={(values) => handleEditDebt(values, item.id)}
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
              message: 'Digite um nome para identificacar o débito.',
            },
          ]}
        >
          <TitleInput
            key={`name_${item.id}`}
            id={`name_${item.id}`}
            placeholder='Exemplo: Parcela do Empréstimo'
          />
        </Form.Item>
        <Form.Item
          style={{ margin: 0 }}
          name='value'
          rules={[
            {
              required: true,
              message: 'Digite o valor do débito.',
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
        <ActionButton
          color='red'
          onClick={() =>
            creating ? handleDeleteDebt(item.id) : setCurrentIdEditing(null)
          }
        >
          {creating ? <DeleteOutlined /> : <CloseOutlined />}
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
        <ConfirmButton
          color='orange'
          disabled={currentIdEditing}
          onClick={() => setCurrentIdEditing(item.id)}
        >
          <EditOutlined />
        </ConfirmButton>
      </ButtonsContainer>
      <ButtonsContainer>
        <ConfirmButton
          color='red'
          disabled={currentIdEditing}
          onClick={() => handleDeleteDebt(item.id)}
        >
          <DeleteOutlined />
        </ConfirmButton>
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
    <Container items={otherDebts.length} error={errorFinish ? 30 : 0}>
      <Head>
        <Label>Outras Despezas</Label>
        <AddButton onClick={handleCreateDebt} disabled={currentIdEditing}>
          <PlusOutlined />
        </AddButton>
      </Head>
      {!hasDebts ? (
        <Empty
          title='Nenhuma despeza extra cadastrado'
          message='Clique em adicionar para adicionar débito'
        />
      ) : (
        otherDebts.map((item) => <RenderItem key={item.id} item={item} />)
      )}
    </Container>
  );
}
