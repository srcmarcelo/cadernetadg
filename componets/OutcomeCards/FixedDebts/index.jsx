import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  PlusOutlined,
  RollbackOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, Modal, message } from 'antd';
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
import ReactJoyride from 'react-joyride';
import { fixedDebtsTourSteps } from '../../../utils/toursSteps/fixedDebtsTour';

export default function FixedDebts({ future }) {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const fixedDebts = useSelector(getFixedDebts);
  const reversedFixedDebts = _.reverse(_.cloneDeep(fixedDebts));

  const hasDebts = !_.isEmpty(fixedDebts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [tour, setTour] = useState(false);
  const [fakeDebt, setFakeDebt] = useState(null);

  const handleCreateDebt = (fake) => {
    const number = hasDebts ? getMaxId(fixedDebts) + 1 : 1;
    const id = `${user.id}_${number}`;
    if (fake === true) setFakeDebt(id);
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

    message.success('Nova despesa criada com sucesso.');
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

    message.success(
      `Despesa ${values.name.toUpperCase()} editada com sucesso.`
    );
  };

  const handleDeleteDebt = async (id) => {
    const index = fixedDebts.findIndex((item) => item.id === id);
    const name = fixedDebts[index].name;

    const newDebts = _.cloneDeep(fixedDebts);
    newDebts.splice(index, 1);
    dispatchDeleteFixedDebt(dispatch, newDebts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    message.success(`Despesa ${name.toUpperCase()} deletada com sucesso.`);
  };

  const handleConfirmDebt = async (id, pay) => {
    const index = fixedDebts.findIndex((item) => item.id === id);
    const name = fixedDebts[index].name;

    const newDebts = _.cloneDeep(fixedDebts);

    if (future) {
      newDebts[index].future_payed = !newDebts[index].future_payed;
    } else {
      newDebts[index].payed = !newDebts[index].payed;
    }

    dispatchEditFixedDebts(dispatch, newDebts, supabase, index);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    pay && message.success(`Despesa ${name.toUpperCase()} paga com sucesso.`);
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

  const callbacks = {
    1: () => {
      handleCreateDebt(true);
    },
    3: () => {
      document.getElementsByClassName('fixed_debt_label_0')[0].value = 'Aluguel';
    },
    4: () => {
      document.getElementsByClassName('fixed_debt_value_0')[0].value = 'R$ 500,00';
    },
    5: () => {
      const fakeValues = {
        name: 'Aluguel',
        value: 'R$ 500,00',
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

  const RenderForm = ({ item, index }) => (
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
              className={`fixed_debt_label_${index}`}
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
              className={`fixed_debt_value_${index}`}
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

  const RenderItemContent = ({ item, index }) => {
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
          <RenderActionButton
            color='orange'
            onClick={() => setCurrentIdEditing(item.id)}
            disabled={payed}
            icon={<EditOutlined />}
            className={`fixed_debt_edit_button_${index}`}
          />
          <RenderActionButton
            color='red'
            onClick={() => handleConfirmDeleteModal(item.id)}
            icon={<DeleteOutlined />}
            className={`fixed_debt_delete_button_${index}`}
          />
        </ButtonsContainer>
        <ButtonsContainer>
          <RenderActionButton
            color={payed ? '#368f42' : 'grey'}
            onClick={() => handleConfirmDebt(item.id)}
            icon={payed ? <SelectOutlined /> : <StopOutlined />}
            className={`fixed_debt_disable_button_${index}`}
          />
          <RenderActionButton
            color='#368f42'
            onClick={() => handleConfirmDebt(item.id, true)}
            disabled={payed}
            icon={<CarryOutOutlined />}
            className={`fixed_debt_confirm_button_${index}`}
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
    <Container className='fixedDebtsCard'>
      <ReactJoyride
        steps={fixedDebtsTourSteps}
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
        <Label>Despesas fixas</Label>
        <Buttons>
          <CardTourButton onClick={() => setTour(true)} />
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
          <Total
            array={fixedDebts}
            color='#c83126'
            future={future}
            className='fixedDebtsTotal'
          />
          {reversedFixedDebts.map((item, index) => (
            <RenderItem key={item.id} item={item} index={index} />
          ))}
        </>
      )}
    </Container>
  );
}
