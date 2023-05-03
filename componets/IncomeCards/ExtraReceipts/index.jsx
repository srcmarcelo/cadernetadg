import {
  CarryOutOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SelectOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Form, Modal, message } from 'antd';
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
import ReactJoyride from 'react-joyride';
import { extraReceiptsTourSteps } from '../../../utils/toursSteps/extraReceiptsTour';

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
  const [tour, setTour] = useState(false);
  const [fakeReceipt, setFakeReceipt] = useState(null);

  const handleCreateReceipt = (fake) => {
    const number = !_.isEmpty(allExtraReceipts)
      ? getMaxId(allExtraReceipts) + 1
      : 1;
    const id = `${user.id}_${number}`;
    if (fake === true) setFakeReceipt(id);
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

    message.success('Novo recebimento criado com sucesso.');
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

    message.success(
      `Recebimento ${values.name.toUpperCase()} editado com sucesso.`
    );
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

  const handleConfirmDeleteReceipt = (id, pay) => {
    Modal.confirm({
      title: 'O recebimento será deletado.',
      icon: <ExclamationCircleOutlined />,
      content: 'Caso queira que ele retorne, terá que registra-lo novamente.',
      okText: 'OK',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await handleDeleteReceipt(id, pay);
      },
    });
  };

  const handleDeleteReceipt = async (id, pay) => {
    const index = allExtraReceipts.findIndex((item) => item.id === id);
    const name = allExtraReceipts[index].name;

    const newReceipts = _.cloneDeep(allExtraReceipts);
    newReceipts.splice(index, 1);
    dispatchDeleteExtraReceipt(dispatch, newReceipts, supabase, id);
    creating && setCreating(false);
    currentIdEditing && setCurrentIdEditing(null);

    message.success(
      pay
        ? `Pagamento de ${name.toUpperCase()} confirmado com sucesso.`
        : `Recebimento ${name.toUpperCase()} deletado com sucesso.`
    );
  };

  const callbacks = {
    1: () => {
      handleCreateReceipt(true);
    },
    3: () => {
      document.getElementsByClassName('extra_receipt_label_0')[0].value =
        'Décimo Terceiro';
    },
    4: () => {
      document.getElementsByClassName('extra_receipt_value_0')[0].value =
        'R$ 400,00';
    },
    5: () => {
      const fakeValues = {
        name: 'Décimo Terceiro',
        value: 'R$ 400,00',
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

  const RenderForm = ({ item, index }) => {
    const initialValues = { ...item };
    if (future) initialValues.value = item.future_value;

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
                className={`extra_receipt_label_${index}`}
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
                className={`extra_receipt_value_${index}`}
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

  const RenderItemContent = ({ item, index }) => {
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
          <RenderActionButton
            color='orange'
            onClick={() => setCurrentIdEditing(item.id)}
            disabled={disabled}
            icon={<EditOutlined />}
            className={`extra_receipt_edit_button_${index}`}
          />
          <RenderActionButton
            color='red'
            onClick={() => handleConfirmDeleteReceipt(item.id)}
            icon={<DeleteOutlined />}
            className={`extra_receipt_delete_button_${index}`}
          />
        </ButtonsContainer>
        <ButtonsContainer>
          <RenderActionButton
            color={disabled ? '#368f42' : 'grey'}
            onClick={() => handleDisableReceipt(item.id)}
            icon={disabled ? <SelectOutlined /> : <StopOutlined />}
            className={`extra_receipt_disable_button_${index}`}
          />
          <RenderActionButton
            color='#368f42'
            onClick={() => handleConfirmDeleteReceipt(item.id, true)}
            disabled={disabled}
            icon={<CarryOutOutlined />}
            className={`extra_receipt_confirm_button_${index}`}
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
    <Container className='extraReceiptsCard'>
      <ReactJoyride
        steps={extraReceiptsTourSteps}
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
        <Label>Extras</Label>
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
          title='Nenhum saldo extra cadastrado'
          onClick={handleCreateReceipt}
        />
      ) : (
        <>
          <Total
            array={extraReceipts}
            future={future}
            className='extraReceiptsTotal'
          />
          {reversedExtraReceipts.map((item, index) => (
            <RenderItem key={item.id} item={item} index={index} />
          ))}
        </>
      )}
    </Container>
  );
}
