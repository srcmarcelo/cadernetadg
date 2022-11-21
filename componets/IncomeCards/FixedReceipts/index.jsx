import React, { useState } from 'react';
import _ from 'lodash';
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
} from './styles';

import { useDispatch, useSelector } from 'react-redux';
import { getFixedReceipts } from '../../../containers/Income/redux/reducer';
import Empty from '../../Empty';
import { dispatchEditFixedReceipts } from '../../../containers/Income/redux';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { Form, Modal } from 'antd';
import CurrencyFormat from 'react-currency-format';

export default function FixedReceipts() {
  const dispatch = useDispatch();
  const fixedReceipts = useSelector(getFixedReceipts);
  const hasReceipts = !_.isEmpty(fixedReceipts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateReceipt = () => {
    const id = hasReceipts ? fixedReceipts[fixedReceipts.length - 1].id + 1 : 1;
    const newReceipt = {
      id: id,
      value: undefined,
      name: '',
      received: false,
    };
    const newReceipts = [...fixedReceipts, newReceipt];
    dispatchEditFixedReceipts(dispatch, newReceipts);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditReceipt = async (values, id) => {
    const index = fixedReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(fixedReceipts);
    const receiptValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newReceipts[index] = {
      id: id,
      value: receiptValue,
      name: values.name,
    };
    dispatchEditFixedReceipts(dispatch, newReceipts);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteReceipt = async (id) => {
    const index = fixedReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(fixedReceipts);
    newReceipts.splice(index, 1);
    dispatchEditFixedReceipts(dispatch, newReceipts);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleConfirmReceipt = async (id) => {
    const index = fixedReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(fixedReceipts);
    newReceipts[index].received = !newReceipts[index].received;
    dispatchEditFixedReceipts(dispatch, newReceipts);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleConfirmDeleteModal = (id) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir este recebimento?',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ele retorne, terá que cria-lo novamente.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'NÃO',
      onOk() {
        handleDeleteReceipt(id);
      },
    });
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
          <TitleInput
            key={`name_${item.id}`}
            id={`name_${item.id}`}
            placeholder='Exemplo: Salário'
          />
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
        <ActionButton
          color='red'
          onClick={() =>
            creating ? handleDeleteReceipt(item.id) : setCurrentIdEditing(null)
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
        <Title received={item.received}>{item.name.toUpperCase()}</Title>
        <RenderValue value={item.value} />
      </ValueContainer>
      <ButtonsContainer>
        {!item.received && (
          <>
            <ActionButton
              color='orange'
              disabled={currentIdEditing}
              onClick={() => setCurrentIdEditing(item.id)}
            >
              <EditOutlined />
            </ActionButton>
            <ActionButton
              color='red'
              disabled={currentIdEditing}
              onClick={() => handleConfirmDeleteModal(item.id)}
            >
              <DeleteOutlined />
            </ActionButton>
          </>
        )}
      </ButtonsContainer>
      <ButtonsContainer>
        <ConfirmButton
          disabled={currentIdEditing}
          color={item.received ? 'grey' : '#368f42'}
          onClick={() => handleConfirmReceipt(item.id)}
        >
          {item.received ? <RollbackOutlined /> : <DollarOutlined />}
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
    <Container items={fixedReceipts.length} error={errorFinish ? 30 : 0}>
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
