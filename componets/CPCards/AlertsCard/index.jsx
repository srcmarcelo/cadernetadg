import { ExclamationCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  getDebtorDependency,
  getLoss,
} from '../../../containers/Main/redux/reducer';
import {
  AlertContainer,
  AlertDescription,
  AlertTitle,
  Container,
  SubTitle,
  Title,
} from './styles';

export default function AlertsCard() {
  const debtorDependency = useSelector(getDebtorDependency);
  const loss = useSelector(getLoss);

  const warnings = [{ debtorDependency: debtorDependency }, { loss: loss }];
  const filteredWarnings = warnings.filter(
    (obj) => Object.values(obj)[0] === true
  );
  const alertAmount = filteredWarnings.length;

  const warningLabels = {
    debtorDependency: {
      title: 'Dependência de devedores',
      description:
        'Isso significa que está dependendo de um ou mais devedores para conseguir quitar suas dívidas.',
    },
    loss: {
      title: 'Saldo mensal negativo',
      description:
        'Isso significa que você está devendo mais do que receberá este mês.',
    },
  };

  const RenderAlert = ({ item }) => (
    <AlertContainer>
      <AlertTitle>{warningLabels[item].title}</AlertTitle>
      <AlertDescription>{warningLabels[item].description}</AlertDescription>
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
