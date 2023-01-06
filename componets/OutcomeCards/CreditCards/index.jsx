import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, Modal } from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteCreditCard,
  dispatchEditCreditCards,
} from '../../../containers/Outcome/redux';
import { getCreditCards } from '../../../containers/Outcome/redux/reducer';
import { getMaxId } from '../../../utils/getMaxId';
import Empty from '../../Empty';
import RenderValue from '../../RenderValue';
import Total from '../../Total';
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
  ConfirmButton,
} from '../FixedDebts/styles';

export default function CreditCards() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const creditCards = useSelector(getCreditCards);
  const hasCards = !_.isEmpty(creditCards);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateCard = () => {
    const number = hasCards ? getMaxId(creditCards) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newCard = {
      id: id,
      value: undefined,
      name: '',
      user_uuid: user.id,
    };
    const newCards = [...creditCards, newCard];
    dispatchEditCreditCards(dispatch, newCards, supabase, newCards.length - 1);
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
    newCards[index].value = debtValue;
    newCards[index].name = values.name;
    dispatchEditCreditCards(dispatch, newCards, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteCard = async (id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const newCards = _.cloneDeep(creditCards);
    newCards.splice(index, 1);
    dispatchDeleteCreditCard(dispatch, newCards, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleResetCard = async (id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const newCards = _.cloneDeep(creditCards);
    newCards[index].value = 0;
    if (creditCards[index].value > 0)
      dispatchEditCreditCards(dispatch, newCards, supabase, index);
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

  const RenderForm = ({ item }) => (
    <FormContainer
      onFinish={(values) => handleEditCard(values, item.id)}
      initialValues={{ ...item }}
      onFinishFailed={() => setErrorFinish(true)}
    >
      <ValueContainer editing={true}>
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
            key={`credit_card_name_${item.id}`}
            id={`credit_card_name_${item.id}`}
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
        <RenderValue
          value={item.value}
          fontSize='1.5rem'
          color='#c83126'
          start='true'
        />
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
        <>
          <Total array={creditCards} color='#c83126' />
          {creditCards.map((item) => (
            <RenderItem key={item.id} item={item} />
          ))}
        </>
      )}
    </Container>
  );
}
