import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  PlusOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, message } from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteExtraReceipt,
  dispatchEditExtraReceipts,
} from '../../../containers/Income/redux';
import { getExtraReceipts } from '../../../containers/Income/redux/reducer';
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
} from '../FixedReceipts/styles';
import CardTourButton from '../../CardTourButton';
import AddItem from '../../AddItem';

export default function ExtraReceipts({ future }) {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const allExtraReceipts = useSelector(getExtraReceipts);
  const extraReceipts = useSelector(getExtraReceipts).filter(
    (item) => future === item.future
  );
  const reversedExtraReceipts = _.reverse(_.cloneDeep(extraReceipts));

  const hasReceipts = !_.isEmpty(extraReceipts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreateReceipt = () => {
    const number = !_.isEmpty(allExtraReceipts)
      ? getMaxId(allExtraReceipts) + 1
      : 1;
    const id = `${user.id}_${number}`;
    const newReceipt = {
      id: id,
      value: 0,
      future_value: 0,
      name: '',
      user_uuid: user.id,
      disabled: future,
      future_disabled: !future,
      future: future,
    };
    const newReceipts = [...allExtraReceipts, newReceipt];
    dispatchEditExtraReceipts(
      dispatch,
      newReceipts,
      supabase,
      newReceipts.length - 1
    );
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditReceipt = async (values, id) => {
    const index = allExtraReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(allExtraReceipts);
    const receiptValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    if (future) {
      newReceipts[index].future_value = receiptValue;
    } else {
      newReceipts[index].value = receiptValue;
    }
    newReceipts[index].name = values.name;
    dispatchEditExtraReceipts(dispatch, newReceipts, supabase, index);
    setCurrentIdEditing(null);
    setCreating(false);
  };

  const handleDisableReceipt = async (id) => {
    const index = allExtraReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(allExtraReceipts);

    if (future) {
      newReceipts[index].future_disabled = !newReceipts[index].future_disabled;
    } else {
      newReceipts[index].disabled = !newReceipts[index].disabled;
    }

    await dispatchEditExtraReceipts(dispatch, newReceipts, supabase, index);
    setCurrentIdEditing(null);
  };

  const handleDeleteReceipt = async (id, name) => {
    const index = allExtraReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(allExtraReceipts);
    newReceipts.splice(index, 1);
    dispatchDeleteExtraReceipt(dispatch, newReceipts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    name && message.success(`Pagamento de ${name.toUpperCase()} confirmado!`)
  };

  const RenderForm = ({ item }) => {
    const initialValues = { ...item };
    if(future) initialValues.value = item.future_value;

    return (
      <FormContainer
        onFinish={(values) => handleEditReceipt(values, item.id)}
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
                  message: 'Digite um nome para identificacar o recebimento.',
                },
              ]}
            >
              <TitleInput
                key={`extra_receipt_name_${item.id}`}
                id={`extra_receipt_name_${item.id}`}
                placeholder='Exemplo: Décimo terceiro'
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
          </InputContainer>
        </ValueContainer>
        <ButtonsContainer>
          <ActionButton color='green' htmlType='submit'>
            <CheckOutlined />
          </ActionButton>
          <ActionButton
            color='red'
            onClick={() =>
              creating
                ? handleDeleteReceipt(item.id)
                : setCurrentIdEditing(null)
            }
          >
            {creating ? <DeleteOutlined /> : <CloseOutlined />}
          </ActionButton>
        </ButtonsContainer>
      </FormContainer>
    );
  };

  const RenderItemContent = ({ item }) => {
    const disabled = future ? item.future_disabled : item.disabled;
    const value = future ? item.future_value : item.value;

    if (future !== item.future) return;

    return (
      <ItemContent>
        <ValueContainer>
          <Title disabled={disabled}>{item.name.toUpperCase()}</Title>
          <RenderValue
            value={value}
            fontSize='1.5rem'
            textAlign='start'
            color={disabled ? 'grey' : '#368f42'}
          />
        </ValueContainer>
        <ButtonsContainer>
          <ActionButton
            color={disabled ? '#368f42' : 'grey'}
            disabled={currentIdEditing}
            onClick={() => handleDisableReceipt(item.id)}
          >
            {disabled ? <SelectOutlined /> : <StopOutlined />}
          </ActionButton>
          <ActionButton
            color='orange'
            disabled={currentIdEditing || disabled}
            onClick={() => setCurrentIdEditing(item.id)}
          >
            <EditOutlined />
          </ActionButton>
        </ButtonsContainer>
        <ButtonsContainer>
          <ConfirmButton
            color='#368f42'
            disabled={currentIdEditing}
            onClick={() => handleDeleteReceipt(item.id, item.name)}
          >
            <DollarOutlined />
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
        <Label>Extras</Label>
        <Buttons>
          {/* <CardTourButton /> */}
          <AddItem
            onClick={handleCreateReceipt}
            disabled={currentIdEditing || !hasReceipts}
            style={{ marginLeft: '10px' }}
          />
        </Buttons>
      </Head>
      {!hasReceipts ? (
        <Empty
          title='Nenhum saldo extra cadastrado'
          onClick={handleCreateReceipt}
        />
      ) : (
        <>
          <Total array={extraReceipts} future={future} />
          {reversedExtraReceipts.map((item) => (
            <RenderItem key={item.id} item={item} />
          ))}
        </>
      )}
    </Container>
  );
}
