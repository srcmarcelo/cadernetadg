import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  RollbackOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, InputNumber, Modal } from 'antd';
import React, { useState } from 'react';
import CurrencyFormat from 'react-currency-format';
import { useDispatch, useSelector } from 'react-redux';
import {
  dispatchDeleteDebt,
  dispatchDeleteDebtor,
  dispatchEditDebtors,
  dispatchEditDebts,
  dispatchFetchDebts,
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
  DisplayValue,
  ConfirmButton,
  DebtorContainer,
  DebtorHeader,
  DebtorNameContainer,
  DebtorValueContainer,
  DebtorButtonsContainer,
  EditNameButton,
  DebtsContainer,
  DebtContainer,
  TitleDebtInput,
  DisplayDebtValue,
  DebtContent,
  TitleDebt,
  InstallmentsContainer,
  InstalmentsLabel,
  TitleInputContainer,
  TotalContainer,
  TotalLabel,
  TotalValueContainer,
} from './styles';

export default function Debtors() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const debtors = useSelector(getDebtors);
  const reversedDebtors = _.reverse(_.cloneDeep(debtors));
  const hasDebtors = !_.isEmpty(debtors);

  const debts = useSelector(getDebts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [errorFinish, setErrorFinish] = useState(false);
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

  const handleCreateDebt = (debtorId, hasDebts, debtorDebts) => {
    const number = hasDebts ? getMaxId(debtorDebts, 2) + 1 : 1;
    const id = `${debtorId}_${number}`;
    const newDebt = {
      id: id,
      value: undefined,
      name: '',
      user_uuid: user.id,
      debtor_id: debtorId,
      disabled: false,
      installments: 1,
      current_pay: 1,
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
    newDebts[index].current_pay = values.current_pay || 1;
    const debtValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newDebts[index].value = debtValue;
    await dispatchEditDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
    setCreating(false);
  };

  const handleDisableDebt = async (id) => {
    const index = debts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(debts);
    newDebts[index].disabled = !newDebts[index].disabled;
    await dispatchEditDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
  };

  const handleIncreaseInstallment = async (id) => {
    const index = debts.findIndex((item) => item.id === id);
    const newDebts = _.cloneDeep(debts);
    newDebts[index].current_pay = newDebts[index].current_pay + 1;
    await dispatchEditDebts(dispatch, newDebts, supabase, index);
    setCurrentIdEditing(null);
    setErrorFinish(false);
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
      content: 'Caso queira que ele retorne, ter?? que registra-lo novamente.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'N??O',
      onOk: async () => {
        await debtorDebts.forEach(
          async (debt) => await handleDeleteDebt(debt.id)
        );
        await handleDeleteDebtor(id);
      },
    });
  };

  const RenderForm = ({ debt }) => (
    <FormContainer
      onFinish={(values) => handleEditDebt(values, debt.id)}
      initialValues={{ ...debt }}
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
              message: 'Digite o valor do d??bito.',
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

  const RenderDebtContent = ({ debt }) => (
    <DebtContent>
      <ValueContainer>
        <TitleDebt disabled={debt.disabled}>
          {debt.name.toUpperCase()}
        </TitleDebt>
        <RenderValue
          value={debt.value}
          debt={true}
          color={debt.disabled ? 'grey' : null}
        />
      </ValueContainer>
      <InstallmentsContainer>
        <InstalmentsLabel color={debt.disabled ? 'grey' : 'black'}>
          Parcela
        </InstalmentsLabel>
        <div
          style={{
            fontSize: '0.9rem',
            color: debt.disabled ? 'grey' : 'black',
          }}
        >
          {debt.current_pay} de {debt.installments}
        </div>
      </InstallmentsContainer>
      <ButtonsContainer>
        <ActionButton
          color={debt.disabled ? '#368f42' : 'grey'}
          disabled={currentIdEditing}
          onClick={() => handleDisableDebt(debt.id)}
        >
          {debt.disabled ? <SelectOutlined /> : <StopOutlined />}
        </ActionButton>
        <ActionButton
          color='orange'
          disabled={currentIdEditing || debt.disabled}
          onClick={() => setCurrentIdEditing(debt.id)}
        >
          <EditOutlined />
        </ActionButton>
        <ActionButton
          color='#368f42'
          disabled={currentIdEditing || debt.disabled}
          onClick={() =>
            debt.installments - debt.current_pay < 1
              ? handleDeleteDebt(debt.id)
              : handleIncreaseInstallment(debt.id)
          }
        >
          <CarryOutOutlined />
        </ActionButton>
      </ButtonsContainer>
    </DebtContent>
  );

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
            placeholder='Exemplo: Cumadre Marisa'
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
    const debtorDebts = debts.filter((debt) => debt.debtor_id === debtor.id);
    const reversedDebtorsDebts = _.reverse(_.cloneDeep(debtorDebts));
    const hasDebtorDebts = !_.isEmpty(debtorDebts);
    let debtsValue = 0;

    debtorDebts.forEach(({ value, disabled }, index) => {
      if (value && !disabled) {
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
              <DebtorButtonsContainer>
                <ActionButton
                  color='red'
                  disabled={currentIdEditing}
                  onClick={() =>
                    handleConfirmDeleteModal(debtor.id, debtorDebts)
                  }
                >
                  <DeleteOutlined />
                </ActionButton>
                <ActionButton
                  color='blue'
                  disabled={currentIdEditing}
                  onClick={() =>
                    handleCreateDebt(debtor.id, hasDebtorDebts, debtorDebts)
                  }
                >
                  <PlusOutlined />
                </ActionButton>
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
              <h5>Digite o nome da pessoa que te deve algo este m??s</h5>
            </div>
          ) : (
            <Empty
              title='Nenhum d??bito cadastrado'
              message='Clique em adicionar para adicionar d??vida'
              sizeAdjust={4}
            />
          )}
        </DebtsContainer>
      </DebtorContainer>
    );
  };

  return (
    <Container
      debtors={debtors.length}
      debts={debts.length}
      error={errorFinish ? 30 : 0}
    >
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
        <>
          <Total array={debts} />
          {reversedDebtors.map((debtor) => (
            <RenderDebtor key={debtor.id} debtor={debtor} />
          ))}
        </>
      )}
    </Container>
  );
}
