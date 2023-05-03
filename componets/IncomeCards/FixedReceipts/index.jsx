import React, { useState } from 'react';
import _ from 'lodash';
import { Form, Modal, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

import {
  Container,
  Head,
  Label,
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
  InputContainer,
  InputLabel,
  Buttons,
} from './styles';

import { getFixedReceipts } from '../../../containers/Income/redux/reducer';
import Empty from '../../Empty';
import {
  dispatchDeleteFixedReceipt,
  dispatchEditFixedReceipts,
} from '../../../containers/Income/redux';
import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  RollbackOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { getMaxId } from '../../../utils/getMaxId';
import RenderValue from '../../RenderValue';
import Total from '../../Total';
import CardTourButton from '../../CardTourButton';
import AddItem from '../../AddItem';
import ReactJoyride from 'react-joyride';
import { fixedReceiptsTourSteps } from '../../../utils/toursSteps/fixedReceiptsTour';

export default function FixedReceipts({ future }) {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const fixedReceipts = useSelector(getFixedReceipts);
  const reversedFixedReceipts = _.reverse(_.cloneDeep(fixedReceipts));

  const hasReceipts = !_.isEmpty(fixedReceipts);

  const [currentIdEditing, setCurrentIdEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [tour, setTour] = useState(false);
  const [fakeReceipt, setFakeReceipt] = useState(null);

  const handleCreateReceipt = (fake) => {
    const number = hasReceipts ? getMaxId(fixedReceipts) + 1 : 1;
    const id = `${user.id}_${number}`;
    if (fake === true) setFakeReceipt(id);
    const newReceipt = {
      id: id,
      value: undefined,
      name: '',
      received: future,
      user_uuid: user.id,
    };
    const newReceipts = [...fixedReceipts, newReceipt];
    dispatchEditFixedReceipts(
      dispatch,
      newReceipts,
      supabase,
      newReceipts.length - 1
    );
    setCreating(true);
    setCurrentIdEditing(id);

    message.success('Novo recebimento criado com sucesso.');
  };

  const handleEditReceipt = async (values, id) => {
    const index = fixedReceipts.findIndex((item) => item.id === id);
    const newReceipts = _.cloneDeep(fixedReceipts);
    const receiptValue =
      typeof values.value === 'string'
        ? parseFloat(
            values.value.slice(3).replaceAll('.', '').replace(',', '.')
          )
        : values.value;
    newReceipts[index].value = receiptValue;
    newReceipts[index].name = values.name;
    dispatchEditFixedReceipts(dispatch, newReceipts, supabase, index);
    setCurrentIdEditing(null);
    setCreating(false);

    message.success(
      `Recebimento ${values.name.toUpperCase()} editado com sucesso.`
    );
  };

  const handleDeleteReceipt = async (id) => {
    const index = fixedReceipts.findIndex((item) => item.id === id);
    const name = fixedReceipts[index].name;

    const newReceipts = _.cloneDeep(fixedReceipts);
    newReceipts.splice(index, 1);
    dispatchDeleteFixedReceipt(dispatch, newReceipts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    message.success(`Recebimento ${name.toUpperCase()} deletado com sucesso.`);
  };

  const handleConfirmReceipt = async (id, pay) => {
    const index = fixedReceipts.findIndex((item) => item.id === id);
    const name = fixedReceipts[index].name;

    const newReceipts = _.cloneDeep(fixedReceipts);

    if (future) {
      newReceipts[index].future_received = !newReceipts[index].future_received;
    } else {
      newReceipts[index].received = !newReceipts[index].received;
    }

    dispatchEditFixedReceipts(dispatch, newReceipts, supabase, index);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    pay &&
      message.success(
        `Pagamento de ${name.toUpperCase()} confirmado com sucesso.`
      );
  };

  const handleConfirmDeleteModal = (id) => {
    Modal.confirm({
      title: 'Tem certeza que deseja excluir este recebimento?',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ele retorne, terá que cria-lo novamente.',
      okText: 'SIM',
      okType: 'danger',
      cancelText: 'NÃO',
      onOk() {
        handleDeleteReceipt(id);
      },
    });
  };

  const callbacks = {
    1: () => {
      handleCreateReceipt(true);
    },
    3: () => {
      document.getElementsByClassName('fixed_receipt_label_0')[0].value = 'Salário';
    },
    4: () => {
      document.getElementsByClassName('fixed_receipt_value_0')[0].value =
        'R$ 2.000,00';
    },
    5: () => {
      const fakeValues = {
        name: 'Salário',
        value: 'R$ 2.000,00',
      };
      handleEditReceipt(fakeValues, fakeReceipt);
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
      onFinish={(values) => handleEditReceipt(values, item.id)}
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
                message: 'Digite um nome para identificacar o recebimento.',
              },
            ]}
          >
            <TitleInput
              key={`fixed_receipt_name_${item.id}`}
              id={`fixed_receipt_name_${item.id}`}
              placeholder='Exemplo: Salário'
              className={`fixed_receipt_label_${index}`}
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
              className={`fixed_receipt_value_${index}`}
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
            creating ? handleDeleteReceipt(item.id) : setCurrentIdEditing(null)
          }
        >
          {creating ? <DeleteOutlined /> : <CloseOutlined />}
        </ActionButton>
      </ButtonsContainer>
    </FormContainer>
  );

  const RenderItemContent = ({ item, index }) => {
    const received = future ? item.future_received : item.received;

    return (
      <ItemContent>
        <ValueContainer>
          <Title received={received}>{item.name.toUpperCase()}</Title>
          <RenderValue
            value={item.value}
            fontSize='1.5rem'
            textAlign='start'
            color={received ? 'grey' : '#368f42'}
          />
        </ValueContainer>
        <ButtonsContainer>
          <RenderActionButton
            color='orange'
            onClick={() => setCurrentIdEditing(item.id)}
            disabled={received}
            icon={<EditOutlined />}
            className={`fixed_receipt_edit_button_${index}`}
          />
          <RenderActionButton
            color='red'
            onClick={() => handleConfirmDeleteModal(item.id)}
            icon={<DeleteOutlined />}
            className={`fixed_receipt_delete_button_${index}`}
          />
        </ButtonsContainer>
        <ButtonsContainer>
          <RenderActionButton
            color={received ? '#368f42' : 'grey'}
            onClick={() => handleConfirmReceipt(item.id)}
            icon={received ? <SelectOutlined /> : <StopOutlined />}
            className={`fixed_receipt_disable_button_${index}`}
          />
          <RenderActionButton
            color='#368f42'
            onClick={() => handleConfirmReceipt(item.id, true)}
            disabled={received}
            icon={<CarryOutOutlined />}
            className={`fixed_receipt_confirm_button_${index}`}
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
    <Container className='fixedReceiptsCard'>
      <ReactJoyride
        steps={fixedReceiptsTourSteps}
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
            handleDeleteReceipt(fakeReceipt);
            setTour(false);
            setFakeReceipt(null);
          }
          if (index === 1 && !fakeReceipt) callbacks[index]();
          else if (callbacks[index] && index !== 1 && action === 'update')
            callbacks[index]();
        }}
      />
      <Head>
        <Label>Fixos</Label>
        <Buttons>
          <CardTourButton onClick={() => setTour(true)} />
          <AddItem
            onClick={handleCreateReceipt}
            disabled={currentIdEditing || !hasReceipts}
            style={{ marginLeft: '10px' }}
          />
        </Buttons>
      </Head>
      {!hasReceipts ? (
        <Empty
          title='Nenhum recebimento fixo cadastrado'
          onClick={handleCreateReceipt}
        />
      ) : (
        <>
          <Total
            array={fixedReceipts}
            future={future}
            className='fixedReceiptsTotal'
          />
          {reversedFixedReceipts.map((item, index) => (
            <RenderItem key={item.id} item={item} index={index} />
          ))}
        </>
      )}
    </Container>
  );
}
