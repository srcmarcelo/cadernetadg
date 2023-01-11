import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  getDebtorDependency,
  getLoss,
  getTotalDebtorsDebts,
  getTotalDebts,
  getWillReceive,
} from '../../../containers/Main/redux/reducer';
import RenderValue from '../../RenderValue';
import {
  AlertContainer,
  AlertDescription,
  AlertTitle,
  Balance,
  BalanceLabel,
  Container,
  Content,
  ContentTitle,
  DetailsButton,
  SubTitle,
  Title,
} from './styles';

export default function AlertsCard() {
  const willReceive = useSelector(getWillReceive);
  const totalDebts = useSelector(getTotalDebts);
  const totalDebtorsDebts = useSelector(getTotalDebtorsDebts);

  const debtorDependency = useSelector(getDebtorDependency);
  const loss = useSelector(getLoss);

  const warnings = [{ debtorDependency: debtorDependency }, { loss: loss }];
  const filteredWarnings = warnings.filter(
    (obj) => Object.values(obj)[0] === true
  );
  const alertAmount = filteredWarnings.length;

  const RenderBalance = ({ label, value, color }) => (
    <Balance>
      <BalanceLabel color={color}>{label}</BalanceLabel>
      <RenderValue color={color} value={value} textAlign='end' />
    </Balance>
  );

  const warningLabels = {
    debtorDependency: {
      title: 'Dependência de devedores',
      description:
        'Isso significa que está dependendo de um ou mais devedores para conseguir quitar suas dívidas.',
      label: 'Quanto ainda receberá',
      content: (
        <Content>
          <RenderBalance
            color='#368F42'
            label='Com devedores:'
            value={willReceive}
          />
          <RenderBalance
            color='orange'
            label='Sem devedores:'
            value={willReceive - totalDebtorsDebts}
          />
        </Content>
      ),
    },
    loss: {
      title: 'Saldo mensal negativo',
      description:
        'Isso significa que você está devendo mais do que receberá este mês.',
      label: 'Balanço atual mensal',
      content: (
        <Content>
          <RenderBalance
            color='#368F42'
            label='Ainda receberá:'
            value={willReceive}
          />
          <RenderBalance
            color='#C83126'
            label='Ainda deve:'
            value={totalDebts}
          />
          <RenderBalance
            color='black'
            label='Diferença:'
            value={totalDebts - willReceive}
          />
        </Content>
      ),
    },
  };

  const RenderAlert = ({ item }) => (
    <AlertContainer>
      <AlertTitle>{warningLabels[item].title}</AlertTitle>
      <AlertDescription>{warningLabels[item].description}</AlertDescription>
      <Popover
        content={warningLabels[item].content}
        title={
          <ContentTitle style={{ textAlign: 'center' }}>
            {warningLabels[item].label}
          </ContentTitle>
        }
        trigger='click'
      >
        <DetailsButton>Ver Detalhes</DetailsButton>
      </Popover>
    </AlertContainer>
  );

  return (
    <Container item={alertAmount}>
      <Title>
        ALERTAS <ExclamationCircleOutlined />
      </Title>
      <SubTitle>
        Você tem {<strong style={{ color: 'orange' }}>{alertAmount}</strong>}{' '}
        alerta{alertAmount !== 1 && 's'}
      </SubTitle>
      {filteredWarnings.map((item) => (
        <RenderAlert
          key={Object.keys(item)[0]}
          id={Object.keys(item)[0]}
          item={Object.keys(item)[0]}
        />
      ))}
    </Container>
  );
}
