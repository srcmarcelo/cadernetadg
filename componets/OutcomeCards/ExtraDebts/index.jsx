import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
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
  Buttons,
} from '../FixedDebts/styles';
import CardTourButton from '../../CardTourButton';
import AddItem from '../../AddItem';
import ReactJoyride from 'react-joyride';
import { extraDebtsTourSteps } from '../../../utils/toursSteps/extraDebtsTour';

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
  const [tour, setTour] = useState(false);
  const [fakeDebt, setFakeDebt] = useState(null);

  const handleCreateDebt = (fake) => {
    const number = hasDebts ? getMaxId(extraDebts) + 1 : 1;
    const id = `${user.id}_${number}`;
    if (fake === true) setFakeDebt(id);
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

    message.success('Nova despesa criada com sucesso.');
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

    message.success(
      `Despesa ${values.name.toUpperCase()} editada com sucesso.`
    );
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
      `Parcela ${pay}/${
        newDebts[index].installments
      } de ${name.toUpperCase()} confirmada.`
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
    const name = extraDebts[index].name;

    const newDebts = _.cloneDeep(extraDebts);
    newDebts.splice(index, 1);
    await dispatchDeleteExtraDebt(dispatch, newDebts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    message.success(`Despesa ${name.toUpperCase()} deletada com sucesso.`);
  };

  const callbacks = {
    1: () => {
      handleCreateDebt(true);
    },
    3: () => {
      document.getElementsByClassName('extra_debt_label_0')[0].value =
        'Parcela do empréstimo';
    },
    4: () => {
      document.getElementsByClassName('extra_debt_value_0')[0].value =
        'R$ 150,00';
    },
    6: () => {
      document.getElementsByClassName(
        'extra_debt_current_pay_0'
      )[0].children[0].children[0].value = '4';
    },
    7: () => {
      document.getElementsByClassName(
        'extra_debt_installments_0'
      )[0].children[0].children[0].value = '10';
    },
    8: () => {
      const fakeValues = {
        name: 'Parcela do empréstimo',
        value: 'R$ 150,00',
        current_pay: 4,
        installments: 10,
      };
      handleEditDebt(fakeValues, fakeDebt);
    },
  };

  const RenderActionButton = ({
    color,
    onClick,
    icon,
    disabled,
    className,
  }) => (
    <ActionButton
      color={color}
      disabled={currentIdEditing || disabled}
      onClick={onClick}
      className={className}
    >
      {icon}
    </ActionButton>
  );

  const RenderForm = ({ item, index }) => {
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
              className={`extra_debt_label_${index}`}
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
              className={`extra_debt_value_${index}`}
            />
          </Form.Item>
        </ValueContainer>
        <InstallmentsContainer
          form={'true'}
          className={`extra_debt_installments_field_${index}`}
        >
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
              <InputNumber
                min={1}
                size='small'
                style={{ width: '100%' }}
                className={`extra_debt_current_pay_${index}`}
              />
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
              <InputNumber
                min={1}
                size='small'
                style={{ width: '100%' }}
                className={`extra_debt_installments_${index}`}
              />
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

  const RenderItemContent = ({ item, index }) => {
    const currentPay = future ? item.future_pay : item.current_pay;
    const disabled = future ? item.future_disabled : item.disabled;

    return (
      <ItemContent>
        <ValueContainer installments={'true'}>
          <Title disabled={disabled} size='0.9rem'>
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
          <RenderActionButton
            color='orange'
            onClick={() => setCurrentIdEditing(item.id)}
            disabled={disabled}
            icon={<EditOutlined />}
            className={`extra_debt_edit_button_${index}`}
          />
          <RenderActionButton
            color='red'
            onClick={() => handleConfirmDeleteDebt(item.id)}
            icon={<DeleteOutlined />}
            className={`extra_debt_delete_button_${index}`}
          />
        </ButtonsContainer>
        <ButtonsContainer>
          <RenderActionButton
            color={disabled ? '#368f42' : 'grey'}
            onClick={() => handleDisableDebt(item.id)}
            icon={disabled ? <SelectOutlined /> : <StopOutlined />}
            className={`extra_debt_disable_button_${index}`}
          />
          <RenderActionButton
            color='#368f42'
            onClick={() =>
              item.installments - currentPay < 1
                ? handleConfirmDeleteDebt(item.id)
                : handleIncreaseInstallment(item.id, currentPay, item.name)
            }
            disabled={disabled}
            icon={<CarryOutOutlined />}
            className={`extra_debt_confirm_button_${index}`}
          />
        </ButtonsContainer>
      </ItemContent>
    );
  };

  const RenderItem = ({ item, index }) => {
    return (
      <ItemContainer>
        {item.id === currentIdEditing ? (
          <RenderForm item={item} index={index} />
        ) : (
          <RenderItemContent item={item} index={index} />
        )}
      </ItemContainer>
    );
  };

  return (
    <Container className='extraDebtsCard'>
      <ReactJoyride
        steps={extraDebtsTourSteps}
        run={tour}
        continuous={true}
        showSkipButton={true}
        disableScrolling={true}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          open: 'Abrir legenda',
          skip: 'Pular guia',
        }}
        callback={({ index, action }) => {
          if (action === 'reset') {
            handleDeleteDebt(fakeDebt);
            setTour(false);
            setFakeDebt(null);
          }
          if (index === 1 && !fakeDebt) callbacks[index]();
          else if (callbacks[index] && index !== 1 && action === 'update')
            callbacks[index]();
        }}
      />
      <Head>
        <Label>Outras despesas</Label>
        <Buttons>
          <CardTourButton onClick={() => setTour(true)} />
          <AddItem
            onClick={handleCreateDebt}
            disabled={currentIdEditing || !hasDebts}
            style={{ marginLeft: '10px' }}
          />
        </Buttons>
      </Head>
      {isEmpty(filteredExtraDebts) ? (
        <Empty
          title='Nenhuma despesa extra cadastrada'
          onClick={handleCreateDebt}
        />
      ) : (
        <>
          <Total
            array={filteredExtraDebts}
            color='#c83126'
            future={future}
            className='extraDebtsTotal'
          />
          {reversedExtraDebts.map((item, index) => (
            <RenderItem key={item.id} item={item} index={index} />
          ))}
        </>
      )}
    </Container>
  );
}
