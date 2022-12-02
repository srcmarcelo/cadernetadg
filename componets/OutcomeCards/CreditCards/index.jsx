import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { Form, Modal } from 'antd';
import React, { useState } from 'react';
import CurrencyFormat from 'react-currency-format';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchEditCreditCards } from '../../../containers/Outcome/redux';
import { getCreditCards } from '../../../containers/Outcome/redux/reducer';
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

export default function CreditCards() {
  const dispatch = useDispatch();
  const creditCards = useSelector(getCreditCards);
  const hasCards = !_.isEmpty(creditCards);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const getMaxId = (arr) => {
    let max = arr[0].id;
    arr.forEach((item) => {
      if (item.id > max) max = item.id;
    });
  };

  const handleCreateCard = () => {
    const id = hasCards ? getMaxId(creditCards) + 1 : 1;
    const newCard = {
      id: id,
      value: undefined,
      name: '',
      payed: false,
    };
    const newCards = [...creditCards, newCard];
    dispatchEditCreditCards(dispatch, newCards);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditCard = async (values, id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const newCards = _.cloneDeep(creditCards);
    const debtValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newCards[index] = {
      id: id,
      value: debtValue,
      name: values.name,
    };
    dispatchEditCreditCards(dispatch, newCards);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteCard = async (id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const newCards = _.cloneDeep(creditCards);
    newCards.splice(index, 1);
    dispatchEditCreditCards(dispatch, newCards);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleResetCard = async (id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const newCards = _.cloneDeep(creditCards);
    newCards[index].value = 0;
    if (creditCards[index].value > 0)
      dispatchEditCreditCards(dispatch, newCards);
  };

  const handleConfirmDeleteModal = (id) => {
    Modal.confirm({
      title: 'Realmente deseja excluir esta fatura?',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ela retorne, terá que cria-la novamente.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'NÃO',
      onOk() {
        handleDeleteCard(id);
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
      onFinish={(values) => handleEditCard(values, item.id)}
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
            placeholder='Exemplo: Itau'
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
            creating ? handleDeleteCard(item.id) : setCurrentIdEditing(null)
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
      </ButtonsContainer>
      <ButtonsContainer>
        <ConfirmButton
          disabled={currentIdEditing}
          color={item.value == 0 ? 'grey' : '#368f42'}
          onClick={() => handleResetCard(item.id)}
        >
          <CarryOutOutlined />
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
    <Container items={creditCards.length} error={errorFinish ? 30 : 0}>
      <Head>
        <Label>Faturas</Label>
        <AddButton onClick={handleCreateCard} disabled={currentIdEditing}>
          <PlusOutlined />
        </AddButton>
      </Head>
      {!hasCards ? (
        <Empty
          title='Nenhum cartão de crédito cadastrado'
          message='Clique em adicionar para adicionar cartão'
        />
      ) : (
        creditCards.map((item) => <RenderItem key={item.id} item={item} />)
      )}
    </Container>
  );
}
