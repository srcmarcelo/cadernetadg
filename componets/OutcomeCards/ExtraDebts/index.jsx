import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileDoneOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form } from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteExtraDebt,
  dispatchEditExtraDebts,
} from '../../../containers/Outcome/redux';
import { getExtraDebts } from '../../../containers/Outcome/redux/reducer';
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

export default function ExtraDebts() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const extraDebts = useSelector(getExtraDebts);
  const hasDebts = !_.isEmpty(extraDebts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateDebt = () => {
    const number = hasDebts ? getMaxId(extraDebts) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newDebt = {
      id: id,
      value: undefined,
      name: '',
      user_uuid: user.id,
    };
    const newDebts = [...extraDebts, newDebt];
    dispatchEditExtraDebts(dispatch, newDebts, supabase, newDebts.length - 1);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditDebt = async (values, id) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);
    const debtValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newDebts[index].value = debtValue;
    newDebts[index].name = values.name;
    dispatchEditExtraDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteDebt = async (id) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);
    newDebts.splice(index, 1);
    dispatchDeleteExtraDebt(dispatch, newDebts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const RenderForm = ({ item }) => (
    <FormContainer
      onFinish={(values) => handleEditDebt(values, item.id)}
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
            key={`extra_debt_name_${item.id}`}
            id={`extra_debt_name_${item.id}`}
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
        <RenderValue
          value={item.value}
          fontSize='1.5rem'
          color='#c83126'
          start='true'
        />
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
          color='#368f42'
          disabled={currentIdEditing}
          onClick={() => handleDeleteDebt(item.id)}
        >
          <FileDoneOutlined />
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
    <Container items={extraDebts.length} error={errorFinish ? 30 : 0}>
      <Head>
        <Label>Despesas Extras</Label>
        <AddButton onClick={handleCreateDebt} disabled={currentIdEditing}>
          <PlusOutlined />
        </AddButton>
      </Head>
      {!hasDebts ? (
        <Empty
          title='Nenhuma despesa extra cadastrada'
          message='Clique em adicionar para adicionar débito'
        />
      ) : (
        <>
          <Total array={extraDebts} color='#c83126' />
          {extraDebts.map((item) => (
            <RenderItem key={item.id} item={item} />
          ))}
        </>
      )}
    </Container>
  );
}
