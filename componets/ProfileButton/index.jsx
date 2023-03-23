import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getLoadingDebtors,
  getLoadingDebts,
  getLoadingExtraReceipts,
  getLoadingFixedReceipts,
} from '../../containers/Income/redux/reducer';
import {
  getLoadingCurrentBalance,
  getLoadingKeptBalance,
  getLoadingUserInfo,
} from '../../containers/Main/redux/reducer';
import {
  getLoadingCreditCards,
  getLoadingExtraDebts,
  getLoadingFixedDebts,
} from '../../containers/Outcome/redux/reducer';
import {
  Container,
  Help,
  Left,
  LinkText,
  Profile,
  Right,
  SwitchMonth,
} from './styles';

export default function ProfileButton({
  onClickProfile,
  onClickMonth,
  activeTour,
  future,
  currentTab,
}) {
  const loadingFixedReceipts = useSelector(getLoadingFixedReceipts);
  const loadingDebtors = useSelector(getLoadingDebtors);
  const loadingDebts = useSelector(getLoadingDebts);
  const loadingExtraReceipts = useSelector(getLoadingExtraReceipts);

  const loadingCurrentBalance = useSelector(getLoadingCurrentBalance);
  const loadingKeptBalance = useSelector(getLoadingKeptBalance);
  const loadingUserInfo = useSelector(getLoadingUserInfo);

  const loadingFixedDebts = useSelector(getLoadingFixedDebts);
  const loadingExtraDebts = useSelector(getLoadingExtraDebts);
  const loadingCreditCards = useSelector(getLoadingCreditCards);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadings = [
      loadingFixedReceipts,
      loadingDebtors,
      loadingDebts,
      loadingExtraReceipts,
      loadingCurrentBalance,
      loadingKeptBalance,
      loadingUserInfo,
      loadingFixedDebts,
      loadingExtraDebts,
      loadingCreditCards,
    ];

    setLoading(loadings.includes(true));
  }, [
    loadingFixedReceipts,
    loadingDebtors,
    loadingDebts,
    loadingExtraReceipts,
    loadingCurrentBalance,
    loadingKeptBalance,
    loadingUserInfo,
    loadingFixedDebts,
    loadingExtraDebts,
    loadingCreditCards,
  ]);

  const RenderSpin = () =>
    loading && (
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: '20px', color: 'white' }} spin />
        }
      />
    );

  return (
    <Container>
      <Profile selected={currentTab === 'profile'} className='profile-button'>
        <LinkText
          onClick={() => onClickProfile('profile')}
          selected={currentTab === 'profile'}
        >
          Perfil
        </LinkText>
      </Profile>
      <Help onClick={activeTour}>
        {loading ? (
          <RenderSpin />
        ) : (
          <QuestionCircleOutlined style={{ fontSize: '1.2rem' }} />
        )}
      </Help>
      <SwitchMonth future={future} className='swith-month-button'>
        <LinkText onClick={() => onClickMonth(!future)}>
          <Left future={future} />
          {future ? 'Mês atual' : 'Próximo mês'}
          <Right future={future} />
        </LinkText>
      </SwitchMonth>
    </Container>
  );
}
