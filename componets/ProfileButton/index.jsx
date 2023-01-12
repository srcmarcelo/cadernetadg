import { LoadingOutlined } from '@ant-design/icons';
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
import { Container, LinkText } from './styles';

export default function ProfileButton({ onClick }) {
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

  return (
    <Container>
      {loading && (
        <Spin
          indicator={
            <LoadingOutlined
              style={{ fontSize: '20px', color: 'white' }}
              spin
            />
          }
        />
      )}
      <LinkText onClick={() => onClick('profile')}>
        {loading ? 'Atualizando' : 'Perfil e Configurações'}
      </LinkText>
      {loading && (
        <Spin
          indicator={
            <LoadingOutlined
              style={{ fontSize: '20px', color: 'white' }}
              spin
            />
          }
        />
      )}
    </Container>
  );
}
