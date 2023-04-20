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
import { Form, InputNumber, message, Modal } from 'antd';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteDebt,
  dispatchDeleteDebtor,
  dispatchEditDebtors,
  dispatchEditDebts,
} from '../../../containers/Income/redux';
import { getDebtors, getDebts } from '../../../containers/Income/redux/reducer';
import { getMaxId } from '../../../utils/getMaxId';
import Empty from '../../Empty';
import RenderValue from '../../RenderValue';
import Total from '../../Total';
import {
  Container,
  Head,
  Label,
  AddButton,
  ValueContainer,
  Title,
  Value,
  ButtonsContainer,
  ActionButton,
  FormContainer,
  TitleInput,
  DebtorContainer,
  DebtorHeader,
  DebtorNameContainer,
  DebtorValueContainer,
  DebtorButtonsContainer,
  EditNameButton,
  DebtsContainer,
  DebtContainer,
  TitleDebtInput,
  DebtContent,
  TitleDebt,
  InstallmentsContainer,
  InstalmentsLabel,
  TitleInputContainer,
  Buttons,
} from './styles';
import CardTourButton from '../../CardTourButton';
import AddItem from '../../AddItem';

export default function Debtors({ future }) {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const debtors = useSelector(getDebtors);
  const reversedDebtors = _.reverse(_.cloneDeep(debtors));
  const hasDebtors = !_.isEmpty(debtors);

  const debts = useSelector(getDebts);

  const filteredDebts = useMemo(() => {
    const newDebts = debts.filter((debt) => {
      const currentPay = future ? debt.future_pay : debt.current_pay;
      return currentPay <= debt.installments;
    });

    return newDebts;
  }, [debts, future]);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreateDebtor = () => {
    const number = hasDebtors ? getMaxId(debtors) + 1 : 1;
    const id = `${user.id}_${number}`;
    const newDebtor = {
      id: id,
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
    newDebtors[index].name = values.name;
    dispatchEditDebtors(dispatch, newDebtors, supabase, index);
    setCurrentIdEditing(null);
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

  const handleCreateDebt = (debtorId, hasDebts, debtorDebts) => {
    const number = hasDebts ? getMaxId(debtorDebts, 2) + 1 : 1;
    const id = `${debtorId}_${number}`;
    const newDebt = {
      id: id,
      value: undefined,
      name: '',
      user_uuid: user.id,
      debtor_id: debtorId,
      disabled: future,
      installments: 1,
      current_pay: future ? 0 : 1,
      future_pay: future ? 1 : 2,
      future_disabled: false,
    };
    const newDebts = [...debts, newDebt];
    dispatchEditDebts(dispatch, newDebts, supabase, newDebts.length - 1);
    setCreating(true);
    setCurrentIdEditing(id);
  };

  const handleEditDebt = async (values, id) => {
    const index = debts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(debts);
    newDebts[index].name = values.name;
    newDebts[index].installments = values.installments || 1;

    if (future) {
      newDebts[index].future_pay = values.current_pay || 1;
      newDebts[index].current_pay = (values.current_pay || 1) - 1;
    } else {
      newDebts[index].current_pay = values.current_pay || 1;
      newDebts[index].future_pay = (values.current_pay || 1) + 1;
    }

    const debtValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newDebts[index].value = debtValue;
    await dispatchEditDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setCreating(false);
  };

  const handleDisableDebt = async (id) => {
    const index = debts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(debts);

    if (future) {
      newDebts[index].future_disabled = !newDebts[index].future_disabled;
    } else {
      newDebts[index].disabled = !newDebts[index].disabled;
    }

    await dispatchEditDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
  };

  const handleIncreaseInstallment = async (id, name, pay) => {
    const index = debts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(debts);

    newDebts[index].current_pay = newDebts[index].current_pay + 1;
    newDebts[index].future_pay = newDebts[index].future_pay + 1;

    if (future) {
      newDebts[index].future_disabled = true;
    } else {
      newDebts[index].disabled = true;
    }

    await dispatchEditDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);

    message.success(
      `Parcela ${pay}/${
        newDebts[index].installments
      } de ${name.toUpperCase()} confirmada.`
    );
  };

  const handleDeleteDebt = async (id) => {
    await dispatchDeleteDebt(dispatch, user, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);
  };

  const handleConfirmDeleteModal = (id, debtorDebts) => {
    Modal.confirm({
      title: 'Realmente deseja excluir este devedor?',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ele retorne, terá que registra-lo novamente.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'NÃO',
      onOk: async () => {
        await debtorDebts.forEach(
          async (debt) => await handleDeleteDebt(debt.id)
        );
        await handleDeleteDebtor(id);
      },
    });
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

  const RenderForm = ({ debt }) => {
    const initialValues = { ...debt };
    if (future) initialValues.current_pay = debt.future_pay;

    return (
      <FormContainer
        onFinish={(values) => handleEditDebt(values, debt.id)}
        initialValues={initialValues}
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
            <TitleDebtInput
              key={`debt_name_${debt.id}`}
              id={`debt_name_${debt.id}`}
              placeholder='Exemplo: Emprestado'
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
              key={`value_${debt.id}`}
              decimalSeparator=','
              thousandSeparator='.'
              precision={2}
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
        <ButtonsContainer form={'true'}>
          <ActionButton color='green' htmlType='submit'>
            <CheckOutlined />
          </ActionButton>
          <ActionButton
            color='red'
            onClick={() =>
              creating ? handleDeleteDebt(debt.id) : setCurrentIdEditing(null)
            }
          >
            {creating ? <DeleteOutlined /> : <CloseOutlined />}
          </ActionButton>
        </ButtonsContainer>
      </FormContainer>
    );
  };

  const RenderDebtContent = ({ debt }) => {
    const currentPay = future ? debt.future_pay : debt.current_pay;
    const disabled = future ? debt.future_disabled : debt.disabled;

    return (
      <DebtContent>
        <ValueContainer>
          <TitleDebt disabled={disabled}>{debt.name.toUpperCase()}</TitleDebt>
          <RenderValue
            value={debt.value}
            debt={true}
            color={disabled ? 'grey' : null}
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
            {currentPay} de {debt.installments}
          </div>
        </InstallmentsContainer>
        <ButtonsContainer>
          <ActionButton
            color={disabled ? '#368f42' : 'grey'}
            disabled={currentIdEditing}
            onClick={() => handleDisableDebt(debt.id)}
          >
            {disabled ? <SelectOutlined /> : <StopOutlined />}
          </ActionButton>
          <ActionButton
            color='orange'
            disabled={currentIdEditing || disabled}
            onClick={() => setCurrentIdEditing(debt.id)}
          >
            <EditOutlined />
          </ActionButton>
          <ActionButton
            color='#368f42'
            disabled={currentIdEditing || disabled}
            onClick={() =>
              debt.installments - currentPay < 1
                ? handleConfirmDeleteDebt(debt.id)
                : handleIncreaseInstallment(debt.id, debt.name, currentPay)
            }
          >
            <CarryOutOutlined />
          </ActionButton>
        </ButtonsContainer>
      </DebtContent>
    );
  };

  const RenderFormName = ({ debtor }) => (
    <FormContainer
      onFinish={(values) => handleEditDebtor(values, debtor.id)}
      initialValues={{ ...debtor }}
      onFinishFailed={() => setErrorFinish(true)}
    >
      <TitleInputContainer>
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
            key={`debtor_name_${debtor.id}`}
            id={`debtor_name_${debtor.id}`}
            placeholder='Exemplo: Cunhado'
          />
        </Form.Item>
      </TitleInputContainer>
      <ButtonsContainer>
        <EditNameButton color='green' htmlType='submit'>
          <CheckOutlined />
        </EditNameButton>
        <EditNameButton
          color='red'
          onClick={() =>
            creating ? handleDeleteDebtor(debtor.id) : setCurrentIdEditing(null)
          }
        >
          {creating ? <DeleteOutlined /> : <CloseOutlined />}
        </EditNameButton>
      </ButtonsContainer>
    </FormContainer>
  );

  const RenderDebt = ({ debt }) => {
    return (
      <DebtContainer>
        {debt.id === currentIdEditing ? (
          <RenderForm debt={debt} />
        ) : (
          <RenderDebtContent debt={debt} />
        )}
      </DebtContainer>
    );
  };

  const RenderDebtor = ({ debtor }) => {
    const debtorDebts = debts.filter((debt) => {
      const currentPay = future ? debt.future_pay : debt.current_pay;
      return debt.debtor_id === debtor.id && currentPay <= debt.installments;
    });
    const reversedDebtorsDebts = _.reverse(_.cloneDeep(debtorDebts));
    const hasDebtorDebts = !_.isEmpty(debtorDebts);
    let debtsValue = 0;

    debtorDebts.forEach(({ value, disabled, future_disabled }, index) => {
      const currentDisabled = future ? future_disabled : disabled;

      if (value && !currentDisabled) {
        index === 0 ? (debtsValue = value) : (debtsValue += value);
      }
    });

    return (
      <DebtorContainer>
        <DebtorHeader>
          {debtor.id === currentIdEditing ? (
            <RenderFormName debtor={debtor} />
          ) : (
            <>
              <DebtorNameContainer>
                <Title>{debtor.name.toUpperCase()}</Title>
                <EditNameButton
                  color='black'
                  disabled={currentIdEditing}
                  onClick={() => setCurrentIdEditing(debtor.id)}
                >
                  <EditOutlined />
                </EditNameButton>
              </DebtorNameContainer>
              <DebtorValueContainer>
                <RenderValue value={debtsValue} />
              </DebtorValueContainer>
              <DebtorButtonsContainer justifyEnd={currentIdEditing || !hasDebtorDebts}>
                <ActionButton
                  color='red'
                  disabled={currentIdEditing}
                  onClick={() =>
                    handleConfirmDeleteModal(debtor.id, debtorDebts)
                  }
                >
                  <DeleteOutlined />
                </ActionButton>
                <AddItem
                  style={{ backgroundColor: '#8176fb' }}
                  disabled={currentIdEditing || !hasDebtorDebts}
                  onClick={() =>
                    handleCreateDebt(debtor.id, hasDebtorDebts, debtorDebts)
                  }
                >
                  <PlusOutlined />
                </AddItem>
              </DebtorButtonsContainer>
            </>
          )}
        </DebtorHeader>
        <DebtsContainer>
          {hasDebtorDebts ? (
            reversedDebtorsDebts.map((debt) => (
              <RenderDebt key={debt.id} debt={debt} />
            ))
          ) : debtor.id === currentIdEditing ? (
            <div>
              <h4 style={{ textAlign: 'center', fontWeight: 'normal' }}>
                Digite o {<strong>nome</strong>} da pessoa que te deve algo este
                mês e clique no check
              </h4>
            </div>
          ) : (
            <Empty
              title='Nenhum débito cadastrado'
              onClick={() =>
                handleCreateDebt(debtor.id, hasDebtorDebts, debtorDebts)
              }
              sizeAdjust={4}
            />
          )}
        </DebtsContainer>
      </DebtorContainer>
    );
  };

  return (
    <Container>
      <Head>
        <Label>Devedores</Label>
        <Buttons>
          {/* <CardTourButton /> */}
          <AddItem
            onClick={handleCreateDebtor}
            disabled={currentIdEditing || !hasDebtors}
            style={{ marginLeft: '10px' }}
          />
        </Buttons>
      </Head>
      {!hasDebtors ? (
        <Empty title='Nenhum devedor cadastrado' onClick={handleCreateDebtor} />
      ) : (
        <>
          <Total array={filteredDebts} future={future} />
          {reversedDebtors.map((debtor) => (
            <RenderDebtor key={debtor.id} debtor={debtor} />
          ))}
        </>
      )}
    </Container>
  );
}
