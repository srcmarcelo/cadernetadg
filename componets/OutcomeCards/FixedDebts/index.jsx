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
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, Modal } from 'antd';
import React, { useState } from 'react';
import CurrencyFormat from 'react-currency-format';
import { useDispatch, useSelector } from 'react-redux';
import { dispatchEditFixedDebts } from '../../../containers/Outcome/redux';
import { getFixedDebts } from '../../../containers/Outcome/redux/reducer';
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
} from './styles';

export default function FixedDebts() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const fixedDebts = useSelector(getFixedDebts);
  const hasDebts = !_.isEmpty(fixedDebts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateDebt = () => {
    const id = hasDebts ? fixedDebts[fixedDebts.length - 1].id + 1 : 1;
    const newDebt = {
      id: id,
      value: undefined,
      name: '',
      payed: false,
      user_uuid: user.id,
    };
    const newDebts = [...fixedDebts, newDebt];
    dispatchEditFixedDebts(dispatch, newDebts, supabase);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditDebt = async (values, id) => {
    const index = fixedDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(fixedDebts);
    const debtValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;

    newDebts[index].value = debtValue;
    newDebts[index].name = values.name;
    dispatchEditFixedDebts(dispatch, newDebts, supabase);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteDebt = async (id) => {
    const index = fixedDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(fixedDebts);
    newDebts.splice(index, 1);
    dispatchEditFixedDebts(dispatch, newDebts, supabase);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleConfirmDebt = async (id) => {
    const index = fixedDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(fixedDebts);
    newDebts[index].payed = !newDebts[index].payed;
    dispatchEditFixedDebts(dispatch, newDebts, supabase);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleConfirmDeleteModal = (id) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir este débito?',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ele retorne, terá que cria-lo novamente.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'NÃO',
      onOk() {
        handleDeleteDebt(id);
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
            placeholder='Exemplo: Aluguel'
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
        <Title payed={item.payed}>{item.name.toUpperCase()}</Title>
        <RenderValue value={item.value} />
      </ValueContainer>
      <ButtonsContainer>
        {!item.payed && (
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
          color={item.payed ? 'grey' : '#368f42'}
          onClick={() => handleConfirmDebt(item.id)}
        >
          {item.payed ? <RollbackOutlined /> : <FileDoneOutlined />}
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
    <Container items={fixedDebts.length} error={errorFinish ? 30 : 0}>
      <Head>
        <Label>Despesas Fixas</Label>
        <AddButton onClick={handleCreateDebt} disabled={currentIdEditing}>
          <PlusOutlined />
        </AddButton>
      </Head>
      {!hasDebts ? (
        <Empty
          title='Nenhuma despesa fixa cadastrada'
          message='Clique em adicionar para adicionar débito'
        />
      ) : (
        fixedDebts.map((item) => <RenderItem key={item.id} item={item} />)
      )}
    </Container>
  );
}
