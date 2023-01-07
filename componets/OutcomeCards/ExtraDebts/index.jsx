import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileDoneOutlined,
  PlusOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, InputNumber } from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteExtraDebt,
  dispatchEditExtraDebts,
} from '../../../containers/Outcome/redux';
import { getExtraDebts } from '../../../containers/Outcome/redux/reducer';
import { getMaxId } from '../../../utils/getMaxId';
import Empty from '../../Empty';
import {
  InstallmentsContainer,
  InstalmentsLabel,
} from '../../IncomeCards/Debtors/styles';
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
  const reversedExtraDebts = _.reverse(_.cloneDeep(extraDebts));

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
      disabled: false,
      installments: 1,
      current_pay: 1,
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
    newDebts[index].installments = values.installments || 1;
    newDebts[index].current_pay = values.current_pay || 1;
    await dispatchEditExtraDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDisableDebt = async (id) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);
    newDebts[index].disabled = !newDebts[index].disabled;
    await dispatchEditExtraDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
  };

  const handleIncreaseInstallment = async (id) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);
    newDebts[index].current_pay = newDebts[index].current_pay + 1;
    await dispatchEditExtraDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
  };

  const handleDeleteDebt = async (id) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);
    newDebts.splice(index, 1);
    await dispatchDeleteExtraDebt(dispatch, newDebts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const RenderForm = ({ item }) => (
    <FormContainer
      onFinish={(values) => handleEditDebt(values, item.id)}
      initialValues={{ ...item }}
      onFinishFailed={() => setErrorFinish(true)}
    >
      <ValueContainer installments={'true'}>
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
            size='1rem'
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
            size='1.2rem'
          />
        </Form.Item>
      </ValueContainer>
      <InstallmentsContainer form={'true'}>
        <InstalmentsLabel>Parcela</InstalmentsLabel>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Form.Item
            style={{ width: '38%', display: 'flex' }}
            name='current_pay'
            rules={[
              {
                required: false,
                message: 'Coloque a parcela atual.',
              },
            ]}
          >
            <InputNumber min={1} size='small' style={{ width: '100%' }} />
          </Form.Item>
          <div
            style={{
              width: '20%',
              textAlign: 'center',
              alignItems: 'center',
              paddingTop: '7px',
            }}
          >
            de
          </div>
          <Form.Item
            style={{ width: '38%' }}
            name='installments'
            rules={[
              {
                required: false,
                message: 'Coloque a quantidade de parcelas.',
              },
            ]}
          >
            <InputNumber min={1} size='small' style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </InstallmentsContainer>
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
      <ValueContainer installments={'true'}>
        <Title disabled={item.disabled} size='1rem'>
          {item.name.toUpperCase()}
        </Title>
        <RenderValue
          value={item.value}
          color={item.disabled ? 'grey' : '#c83126'}
          start='true'
        />
      </ValueContainer>
      <InstallmentsContainer>
        <InstalmentsLabel color={item.disabled ? 'grey' : 'black'}>
          Parcela
        </InstalmentsLabel>
        <div
          style={{
            fontSize: '0.9rem',
            color: item.disabled ? 'grey' : 'black',
          }}
        >
          {item.current_pay} de {item.installments}
        </div>
      </InstallmentsContainer>
      <ButtonsContainer>
        <ActionButton
          color={item.disabled ? '#368f42' : 'grey'}
          disabled={currentIdEditing}
          onClick={() => handleDisableDebt(item.id)}
        >
          {item.disabled ? <SelectOutlined /> : <StopOutlined />}
        </ActionButton>
        <ActionButton
          color='orange'
          disabled={currentIdEditing || item.disabled}
          onClick={() => setCurrentIdEditing(item.id)}
        >
          <EditOutlined />
        </ActionButton>
      </ButtonsContainer>
      <ButtonsContainer>
        <ConfirmButton
          color='#368f42'
          disabled={currentIdEditing || item.disabled}
          onClick={() =>
            item.installments - item.current_pay < 1
              ? handleDeleteDebt(item.id)
              : handleIncreaseInstallment(item.id)
          }
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
        <Label>Outras Despezas</Label>
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
          {reversedExtraDebts.map((item) => (
            <RenderItem key={item.id} item={item} />
          ))}
        </>
      )}
    </Container>
  );
}
