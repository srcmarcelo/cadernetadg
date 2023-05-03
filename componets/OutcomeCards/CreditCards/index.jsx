import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, Modal, Popover, message } from 'antd';
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
  InputContainer,
  InputLabel,
  PopoverContentContainer,
  Buttons,
} from '../FixedDebts/styles';
import CardTourButton from '../../CardTourButton';
import AddItem from '../../AddItem';

export default function CreditCards({ future }) {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const creditCards = useSelector(getCreditCards);
  const reversedCreditCards = _.reverse(_.cloneDeep(creditCards));

  const hasCards = !_.isEmpty(creditCards);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreateCard = () => {
    const number = hasCards ? getMaxId(creditCards) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newCard = {
      id: id,
      value: 0,
      name: '',
      user_uuid: user.id,
      future_value: 0,
    };
    const newCards = [...creditCards, newCard];
    dispatchEditCreditCards(dispatch, newCards, supabase, newCards.length - 1);
    setCreating(true);
    setCurrentIdEditing(id);

    message.success('Novo cartão criado com sucesso.');
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

    if (future) {
      newCards[index].future_value = debtValue;
    } else {
      newCards[index].value = debtValue;
    }

    newCards[index].name = values.name;
    dispatchEditCreditCards(dispatch, newCards, supabase, index);
    setCurrentIdEditing(null);
    setCreating(false);

    message.success(`Cartão ${values.name.toUpperCase()} editado com sucesso.`);
  };

  const handleDisableCard = async (id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const newCards = _.cloneDeep(creditCards);

    if (future) {
      newCards[index].future_disabled = !newCards[index].future_disabled;
    } else {
      newCards[index].disabled = !newCards[index].disabled;
    }

    await dispatchEditCreditCards(dispatch, newCards, supabase, index);
    setCurrentIdEditing(null);
  };

  const handleDeleteCard = async (id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const name = creditCards[index].name;

    const newCards = _.cloneDeep(creditCards);
    newCards.splice(index, 1);
    dispatchDeleteCreditCard(dispatch, newCards, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    message.success(`Cartão ${name.toUpperCase()} deletado com sucesso.`);
  };

  const handleResetCard = async (id) => {
    const index = creditCards.findIndex((item) => item.id === id);
    const name = creditCards[index].name;

    const newCards = _.cloneDeep(creditCards);
    let currentValue = 0;

    if (future) {
      newCards[index].future_value = 0;
      currentValue = creditCards[index].future_value;
    } else {
      newCards[index].value = newCards[index].future_value;
      newCards[index].disabled = true;
      currentValue = creditCards[index].value;
    }

    dispatchEditCreditCards(dispatch, newCards, supabase, index);
    message.success(
      `Pagamento do cartão ${name.toUpperCase()} confirmado com sucesso.`
    );
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

  const RenderActionButton = ({
    color,
    onClick,
    icon,
    disabled,
    className,
  }) => (
    <ActionButton
      color={color}
      disabled={currentIdEditing || disabled}
      onClick={onClick}
      className={className}
    >
      {icon}
    </ActionButton>
  );

  const RenderForm = ({ item }) => {
    const initialValues = { ...item };
    if (future) initialValues.value = item.future_value;

    return (
      <FormContainer
        onFinish={(values) => handleEditCard(values, item.id)}
        initialValues={initialValues}
      >
        <ValueContainer editing={true}>
          <InputContainer>
            <InputLabel>Nome:</InputLabel>
            <Form.Item
              style={{ margin: 0, width: '100%' }}
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
                placeholder='Exemplo: Nubank'
              />
            </Form.Item>
          </InputContainer>
          <InputContainer>
            <InputLabel>Valor:</InputLabel>
            <Form.Item
              style={{ margin: 0, width: '100%' }}
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
          </InputContainer>
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
  };

  const RenderItemContent = ({ item, index }) => {
    const value = future ? item.future_value : item.value;
    const disabled = future ? item.future_disabled : item.disabled;

    return (
      <ItemContent>
        <ValueContainer>
          <Title disabled={disabled}>{item.name.toUpperCase()}</Title>
          <RenderValue
            value={value}
            fontSize='1.5rem'
            color={disabled ? 'grey' : '#c83126'}
            textAlign='start'
          />
        </ValueContainer>
        <ButtonsContainer>
          <RenderActionButton
            color='orange'
            onClick={() => setCurrentIdEditing(item.id)}
            disabled={disabled}
            icon={<EditOutlined />}
            className={`credit_card_edit_button_${index}`}
          />
          <RenderActionButton
            color='red'
            onClick={() => handleConfirmDeleteModal(item.id)}
            icon={<DeleteOutlined />}
            className={`credit_card_delete_button_${index}`}
          />
        </ButtonsContainer>
        <ButtonsContainer>
          <RenderActionButton
            color={disabled ? '#368f42' : 'grey'}
            onClick={() => handleDisableCard(item.id)}
            icon={disabled ? <SelectOutlined /> : <StopOutlined />}
            className={`credit_card_disable_button_${index}`}
          />
          <RenderActionButton
            color='#368f42'
            onClick={() => handleResetCard(item.id)}
            disabled={disabled}
            icon={<CarryOutOutlined />}
            className={`credit_card_confirm_button_${index}`}
          />
        </ButtonsContainer>
      </ItemContent>
    );
  };

  const RenderItem = ({ item, index }) => {
    return (
      <ItemContainer>
        {item.id === currentIdEditing ? (
          <RenderForm item={item} />
        ) : (
          <RenderItemContent item={item} index={index} />
        )}
      </ItemContainer>
    );
  };

  return (
    <Container>
      <Head>
        <Label>Cartões de crédito</Label>
        <Buttons>
          {/* <CardTourButton /> */}
          <AddItem
            onClick={handleCreateCard}
            disabled={currentIdEditing || !hasCards}
            style={{ marginLeft: '10px' }}
          />
        </Buttons>
      </Head>
      {!hasCards ? (
        <Empty
          title='Nenhum cartão de crédito cadastrado'
          onClick={handleCreateCard}
        />
      ) : (
        <>
          <Total array={creditCards} color='#c83126' future={future} />
          {reversedCreditCards.map((item, index) => (
            <RenderItem key={item.id} item={item} index={index} />
          ))}
        </>
      )}
    </Container>
  );
}
