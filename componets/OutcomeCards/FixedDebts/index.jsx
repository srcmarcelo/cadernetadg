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
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteFixedDebt,
  dispatchEditFixedDebts,
} from '../../../containers/Outcome/redux';
import { getFixedDebts } from '../../../containers/Outcome/redux/reducer';
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
  Buttons,
} from './styles';
import CardTourButton from '../../CardTourButton';
import AddItem from '../../AddItem';

export default function FixedDebts({ future }) {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const fixedDebts = useSelector(getFixedDebts);
  const reversedFixedDebts = _.reverse(_.cloneDeep(fixedDebts));

  const hasDebts = !_.isEmpty(fixedDebts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreateDebt = () => {
    const number = hasDebts ? getMaxId(fixedDebts) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newDebt = {
      id: id,
      value: undefined,
      name: '',
      payed: false,
      user_uuid: user.id,
      future_payed: false,
    };
    const newDebts = [...fixedDebts, newDebt];
    dispatchEditFixedDebts(dispatch, newDebts, supabase, newDebts.length - 1);
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
    dispatchEditFixedDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setCreating(false);
  };

  const handleDeleteDebt = async (id) => {
    const index = fixedDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(fixedDebts);
    newDebts.splice(index, 1);
    dispatchDeleteFixedDebt(dispatch, newDebts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleConfirmDebt = async (id) => {
    const index = fixedDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(fixedDebts);

    if (future) {
      newDebts[index].future_payed = !newDebts[index].future_payed;
    } else {
      newDebts[index].payed = !newDebts[index].payed;
    }

    dispatchEditFixedDebts(dispatch, newDebts, supabase, index);
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

  const RenderForm = ({ item }) => (
    <FormContainer
      onFinish={(values) => handleEditDebt(values, item.id)}
      initialValues={{ ...item }}
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
              key={`fixed_debt_name_${item.id}`}
              id={`fixed_debt_name_${item.id}`}
              placeholder='Exemplo: Aluguel'
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
            creating ? handleDeleteDebt(item.id) : setCurrentIdEditing(null)
          }
        >
          {creating ? <DeleteOutlined /> : <CloseOutlined />}
        </ActionButton>
      </ButtonsContainer>
    </FormContainer>
  );

  const RenderItemContent = ({ item }) => {
    const payed = future ? item.future_payed : item.payed;

    return (
      <ItemContent>
        <ValueContainer>
          <Title payed={payed}>{item.name.toUpperCase()}</Title>
          <RenderValue
            value={item.value}
            color={payed ? 'grey' : '#c83126'}
            fontSize='1.5rem'
            textAlign='start'
          />
        </ValueContainer>
        <ButtonsContainer>
          {!payed && (
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
            color={payed ? 'grey' : '#368f42'}
            onClick={() => handleConfirmDebt(item.id)}
          >
            {payed ? <RollbackOutlined /> : <FileDoneOutlined />}
          </ConfirmButton>
        </ButtonsContainer>
      </ItemContent>
    );
  };

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
    <Container>
      <Head>
        <Label>Despesas fixas</Label>
        <Buttons>
          {/* <CardTourButton /> */}
          <AddItem
            onClick={handleCreateDebt}
            disabled={currentIdEditing || !hasDebts}
            style={{ marginLeft: '10px' }}
          />
        </Buttons>
      </Head>
      {!hasDebts ? (
        <Empty
          title='Nenhuma despesa fixa cadastrada'
          onClick={handleCreateDebt}
        />
      ) : (
        <>
          <Total array={fixedDebts} color='#c83126' future={future} />
          {reversedFixedDebts.map((item) => (
            <RenderItem key={item.id} item={item} />
          ))}
        </>
      )}
    </Container>
  );
}
