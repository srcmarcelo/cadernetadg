import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tag } from 'antd';
import { BankOutlined, LockOutlined } from '@ant-design/icons';
import {
  dispatchSetCurrentBalance,
  dispatchSetKeptBalance,
} from '../../../containers/Main/redux';
import {
  getCurrentBalance,
  getKeptBalance,
  resetToCurrentMonth,
} from '../../../containers/Main/redux/reducer';
import { useSupabaseClient, useUser } from '../../../services/supabaseClient';
import { useMonthlyFinancialView } from '../../../services/useMonthlyFinancialView';
import CurrencyInput from '../../CurrencyInput';
import RenderValue from '../../RenderValue';
import { formatMonthYear } from '../../../utils/monthUtils';

const Card = styled.div`
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 18px 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: #64748B;
`;

export default function BalanceCard() {
  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();

  const view = useMonthlyFinancialView();
  const { isCurrentMonth, isFutureMonth, isPastMonth, openingBalance, projectedKept } = view;

  const [localCurrent, setLocalCurrent] = useState(currentBalance);
  const [localKept, setLocalKept] = useState(keptBalance);

  const currentTimerRef = useRef(null);
  const keptTimerRef = useRef(null);
  const editingCurrentRef = useRef(false);
  const editingKeptRef = useRef(false);

  useEffect(() => {
    if (!editingCurrentRef.current) {
      setLocalCurrent(currentBalance);
    }
  }, [currentBalance]);

  useEffect(() => {
    if (!editingKeptRef.current) {
      setLocalKept(keptBalance);
    }
  }, [keptBalance]);

  const handleCurrentChange = useCallback(
    (nextVal) => {
      editingCurrentRef.current = true;
      setLocalCurrent(nextVal);
      if (currentTimerRef.current) clearTimeout(currentTimerRef.current);
      currentTimerRef.current = setTimeout(async () => {
        await dispatchSetCurrentBalance(dispatch, nextVal, supabase, user);
        editingCurrentRef.current = false;
      }, 700);
    },
    [dispatch, supabase, user]
  );

  const handleKeptChange = useCallback(
    (nextVal) => {
      editingKeptRef.current = true;
      setLocalKept(nextVal);
      if (keptTimerRef.current) clearTimeout(keptTimerRef.current);
      keptTimerRef.current = setTimeout(async () => {
        await dispatchSetKeptBalance(dispatch, nextVal, supabase, user);
        editingKeptRef.current = false;
      }, 700);
    },
    [dispatch, supabase, user]
  );

  if (isPastMonth) {
    return (
      <Card className='balanceCard'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <Tag color='default'>Histórico</Tag>
            <strong style={{ color: '#1E295E' }}>Visualizando mês anterior</strong>
          </div>
          <Button size='small' type='primary' onClick={() => dispatch(resetToCurrentMonth())}>
            Ir para o mês atual
          </Button>
        </div>
        <Hint>
          O saldo bancário em conta reflete o momento presente. Nas abas de Ganhos e Dívidas você pode consultar ou ajustar o histórico deste mês.
        </Hint>
      </Card>
    );
  }

  return (
    <Card className='balanceCard'>
      <RowGrid>
        <FieldBox>
          <LabelRow>
            <span>
              <BankOutlined style={{ marginRight: 6, color: '#16A34A' }} />
              {isFutureMonth ? 'Saldo inicial projetado' : 'Saldo livre em conta'}
            </span>
            {isFutureMonth && <Tag color='blue'>Projeção</Tag>}
          </LabelRow>
          {isCurrentMonth ? (
            <>
              <CurrencyInput
                value={localCurrent}
                onChange={handleCurrentChange}
                fontSize='1.35rem'
                color='#15803D'
                className='currentBalanceInput'
              />
              <Hint>Quanto você tem disponível hoje para pagar contas.</Hint>
            </>
          ) : (
            <>
              <RenderValue
                value={openingBalance}
                color='#15803D'
                fontSize='1.45rem'
                textAlign='flex-start'
                className='futureCurrentBalance'
              />
              <Hint>Calculado automaticamente somando os meses anteriores.</Hint>
            </>
          )}
        </FieldBox>

        <FieldBox>
          <LabelRow>
            <span>
              <LockOutlined style={{ marginRight: 6, color: '#1E295E' }} />
              {isFutureMonth ? 'Reserva projetada' : 'Dinheiro guardado / reserva'}
            </span>
          </LabelRow>
          {isCurrentMonth ? (
            <>
              <CurrencyInput
                value={localKept}
                onChange={handleKeptChange}
                fontSize='1.25rem'
                color='#1E295E'
                className='keptBalanceInput'
              />
              <Hint>Reserva de emergência ou poupança que evita usar no mês.</Hint>
            </>
          ) : (
            <>
              <RenderValue
                value={projectedKept}
                color='#1E295E'
                fontSize='1.35rem'
                textAlign='flex-start'
                className='futureKeptBalance'
              />
              <Hint>Reserva estimada mantendo o planejamento até este mês.</Hint>
            </>
          )}
        </FieldBox>
      </RowGrid>
    </Card>
  );
}
