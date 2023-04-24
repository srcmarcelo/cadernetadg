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

  const callbacks = {
    1: () => {
      handleCreateDebt(true);
    },
    3: () => {
      document.getElementsByClassName('debt_label_0')[0].value = 'Aluguel';
    },
    4: () => {
      document.getElementsByClassName('debt_value_0')[0].value = 'R$ 500,00';
    },
    5: () => {
      const fakeValues = {
        name: 'Aluguel',
        value: 'R$ 500,00',
      };
      handleEditDebt(fakeValues, fakeDebt);
    },
  };

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
              className={`debt_label_${index}`}
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
              className={`debt_value_${index}`}
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
          {!payed && (
            <>
              <ActionButton
                color='orange'
                disabled={currentIdEditing}
                onClick={() => setCurrentIdEditing(item.id)}
                className={`fixed_debt_edit_button_${index}`}
              >
                <EditOutlined />
              </ActionButton>
              <ActionButton
                color='red'
                disabled={currentIdEditing}
                onClick={() => handleConfirmDeleteModal(item.id)}
                className={`fixed_debt_delete_button_${index}`}
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
            className={`fixed_debt_confirm_button_${index}`}
          >
            {payed ? <RollbackOutlined /> : <FileDoneOutlined />}
          </ConfirmButton>
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
          console.log('index:', index);
          console.log('action:', action);
          console.log('fakeDebt:', fakeDebt);
          console.log('!fakeDebt:', !fakeDebt);
          if (action === 'reset') {
            handleDeleteDebt(fakeDebt);
            setTour(false);
            setFakeDebt(null);
          }
          if (index === 1 && !fakeDebt) callbacks[index]();
          else if (callbacks[index] && index !== 1) callbacks[index]();
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
