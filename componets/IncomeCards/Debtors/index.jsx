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
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, Modal } from 'antd';
import React, { useState } from 'react';
import CurrencyFormat from 'react-currency-format';
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteDebtor,
  dispatchEditDebtors,
} from '../../../containers/Income/redux';
import { getDebtors } from '../../../containers/Income/redux/reducer';
import { getMaxId } from '../../../utils/getMaxId';
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
} from '../FixedReceipts/styles';

export default function Debtors() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const debtors = useSelector(getDebtors);
  const hasDebtors = !_.isEmpty(debtors);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateDebtor = () => {
    const number = hasDebtors ? getMaxId(debtors) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newDebtor = {
      id: id,
      value: undefined,
      name: '',
      user_uuid: user.id,
    };
    const newDebtors = [...debtors, newDebtor];
    dispatchEditDebtors(dispatch, newDebtors, supabase, newDebtors.length - 1);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditDebtor = async (values, id) => {
    const index = debtors.findIndex((item) => item.id === id);
    const newDebtors = _.cloneDeep(debtors);
    const debtValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newDebtors[index].value = debtValue;
    newDebtors[index].name = values.name;
    dispatchEditDebtors(dispatch, newDebtors, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteDebtor = async (id) => {
    const index = debtors.findIndex((item) => item.id === id);
    const newDebtors = _.cloneDeep(debtors);
    newDebtors.splice(index, 1);
    dispatchDeleteDebtor(dispatch, newDebtors, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleResetDebtor = async (id) => {
    const index = debtors.findIndex((item) => item.id === id);
    const newDebtors = _.cloneDeep(debtors);
    newDebtors[index].value = 0;
    if (debtors[index].value > 0)
      dispatchEditDebtors(dispatch, newDebtors, supabase, index);
  };

  const handleConfirmDeleteModal = (id) => {
    Modal.confirm({
      title: 'Realmente deseja excluir este devedor?',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ele retorne, terá que registra-lo novamente.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'NÃO',
      onOk() {
        handleDeleteDebtor(id);
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
      onFinish={(values) => handleEditDebtor(values, item.id)}
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
              message: 'Digite um nome para identificacar o devedor.',
            },
          ]}
        >
          <TitleInput
            key={`name_${item.id}`}
            id={`name_${item.id}`}
            placeholder='Exemplo: Cumadre Marisa'
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
            creating ? handleDeleteDebtor(item.id) : setCurrentIdEditing(null)
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
          onClick={() => handleResetDebtor(item.id)}
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
    <Container items={debtors.length} error={errorFinish ? 30 : 0}>
      <Head>
        <Label>Seus Devedores</Label>
        <AddButton onClick={handleCreateDebtor} disabled={currentIdEditing}>
          <PlusOutlined />
        </AddButton>
      </Head>
      {!hasDebtors ? (
        <Empty
          title='Nenhum devedor cadastrado'
          message='Clique em adicionar para adicionar devedor'
        />
      ) : (
        debtors.map((item) => <RenderItem key={item.id} item={item} />)
      )}
    </Container>
  );
}
