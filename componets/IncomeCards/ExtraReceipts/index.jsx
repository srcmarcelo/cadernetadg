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
import { dispatchDeleteExtraReceipt, dispatchEditExtraReceipts } from '../../../containers/Income/redux';
import { getExtraReceipts } from '../../../containers/Income/redux/reducer';
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

export default function ExtraReceipts() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const extraReceipts = useSelector(getExtraReceipts);
  const hasReceipts = !_.isEmpty(extraReceipts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateReceipt = () => {
    const number = hasReceipts ? getMaxId(extraReceipts) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newReceipt = {
      id: id,
      value: undefined,
      name: '',
      user_uuid: user.id,
    };
    const newReceipts = [...extraReceipts, newReceipt];
    dispatchEditExtraReceipts(dispatch, newReceipts, supabase, newReceipts.length-1);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditReceipt = async (values, id) => {
    const index = extraReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(extraReceipts);
    const receiptValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newReceipts[index].value = receiptValue;
    newReceipts[index].name = values.name;
    dispatchEditExtraReceipts(dispatch, newReceipts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDeleteReceipt = async (id) => {
    const index = extraReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(extraReceipts);
    newReceipts.splice(index, 1);
    dispatchDeleteExtraReceipt(dispatch, newReceipts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const RenderValue = ({ value }) => (
    <CurrencyFormat
      value={value}
      displayType={'text'}
      thousandSeparator='.'
      decimalSeparator=','
      extraDecimalScale={true}
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
      <ValueContainer editing={true}>
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
            placeholder='Exemplo: Décimo terceiro'
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
          onClick={() => handleDeleteReceipt(item.id)}
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
    <Container items={extraReceipts.length} error={errorFinish ? 30 : 0}>
      <Head>
        <Label>Recebimentos Extras</Label>
        <AddButton onClick={handleCreateReceipt} disabled={currentIdEditing}>
          <PlusOutlined />
        </AddButton>
      </Head>
      {!hasReceipts ? (
        <Empty
          title='Nenhum saldo extra cadastrado'
          message='Clique em adicionar para adicionar recebimento'
        />
      ) : (
        extraReceipts.map((item) => <RenderItem key={item.id} item={item} />)
      )}
    </Container>
  );
}
