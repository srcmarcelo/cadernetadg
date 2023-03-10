import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  PlusOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, InputNumber, message, Modal } from 'antd';
import { isEmpty } from 'lodash';
import React, { useMemo, useState } from 'react';
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

export default function ExtraDebts({ future }) {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const extraDebts = useSelector(getExtraDebts);

  const filteredExtraDebts = useMemo(() => {
    const newDebts = extraDebts.filter((debt) => {
      const currentPay = future ? debt.future_pay : debt.current_pay;
      return currentPay <= debt.installments;
    });

    return newDebts;
  }, [extraDebts, future]);

  const reversedExtraDebts = _.reverse(_.cloneDeep(filteredExtraDebts));

  const hasDebts = !_.isEmpty(extraDebts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreateDebt = () => {
    const number = hasDebts ? getMaxId(extraDebts) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newDebt = {
      id: id,
      value: undefined,
      name: '',
      user_uuid: user.id,
      disabled: future,
      installments: 1,
      current_pay: future ? 0 : 1,
      future_pay: future ? 1 : 2,
      future_disabled: false,
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

    if (future) {
      newDebts[index].future_pay = values.current_pay || 1;
      newDebts[index].current_pay = (values.current_pay || 1) - 1;
    } else {
      newDebts[index].current_pay = values.current_pay || 1;
      newDebts[index].future_pay = (values.current_pay || 1) + 1;
    }

    await dispatchEditExtraDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setCreating(false);
  };

  const handleDisableDebt = async (id) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);

    if (future) {
      newDebts[index].future_disabled = !newDebts[index].future_disabled;
    } else {
      newDebts[index].disabled = !newDebts[index].disabled;
    }

    await dispatchEditExtraDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
  };

  const handleIncreaseInstallment = async (id, pay, name) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);

    newDebts[index].current_pay = newDebts[index].current_pay + 1;
    newDebts[index].future_pay = newDebts[index].future_pay + 1;

    if (future) {
      newDebts[index].future_disabled = true;
    } else {
      newDebts[index].disabled = true;
    }

    await dispatchEditExtraDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);

    message.success(
      `Parcela ${pay}/${newDebts[index].installments} de ${name.toUpperCase()} confirmada.`
    );
  };

  const handleConfirmDeleteDebt = (id) => {
    Modal.confirm({
      title: 'Como esta foi a última parcela, o débito será deletado.',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ele retorne, terá que registra-lo novamente.',
      okText: 'OK',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await handleDeleteDebt(id);
      },
    });
  };

  const handleDeleteDebt = async (id) => {
    const index = extraDebts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(extraDebts);
    newDebts.splice(index, 1);
    await dispatchDeleteExtraDebt(dispatch, newDebts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const RenderForm = ({ item }) => {
    const initialValues = { ...item };
    if (future) initialValues.current_pay = item.future_value;

    return (
      <FormContainer
        onFinish={(values) => handleEditDebt(values, item.id)}
        initialValues={initialValues}
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
              placeholder='Exemplo: IPVA'
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
  };

  const RenderItemContent = ({ item }) => {
    const currentPay = future ? item.future_pay : item.current_pay;
    const disabled = future ? item.future_disabled : item.disabled;

    return (
      <ItemContent>
        <ValueContainer installments={'true'}>
          <Title disabled={disabled} size='1rem'>
            {item.name.toUpperCase()}
          </Title>
          <RenderValue
            value={item.value}
            color={disabled ? 'grey' : '#c83126'}
            textAlign='start'
          />
        </ValueContainer>
        <InstallmentsContainer>
          <InstalmentsLabel color={disabled ? 'grey' : 'black'}>
            Parcela
          </InstalmentsLabel>
          <div
            style={{
              fontSize: '0.8rem',
              color: disabled ? 'grey' : 'black',
              textAlign: 'center',
            }}
          >
            {currentPay} de {item.installments}
          </div>
        </InstallmentsContainer>
        <ButtonsContainer>
          <ActionButton
            color={disabled ? '#368f42' : 'grey'}
            disabled={currentIdEditing}
            onClick={() => handleDisableDebt(item.id)}
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
            disabled={currentIdEditing || disabled}
            onClick={() =>
              item.installments - currentPay < 1
                ? handleConfirmDeleteDebt(item.id)
                : handleIncreaseInstallment(item.id, currentPay, item.name)
            }
          >
            <FileDoneOutlined />
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
        <Label>Outras Despesas</Label>
        <AddButton onClick={handleCreateDebt} disabled={currentIdEditing}>
          <PlusOutlined />
        </AddButton>
      </Head>
      {isEmpty(filteredExtraDebts) ? (
        <Empty
          title='Nenhuma despesa extra cadastrada'
          message='Clique no botão de "+" para adicionar débito'
        />
      ) : (
        <>
          <Total array={filteredExtraDebts} color='#c83126' future={future} />
          {reversedExtraDebts.map((item) => (
            <RenderItem key={item.id} item={item} />
          ))}
        </>
      )}
    </Container>
  );
}
