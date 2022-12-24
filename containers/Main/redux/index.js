import React from 'react';
import { setCurrentBalance } from './reducer';
import { setDebtors, setDebts, setExtraReceipts, setFixedReceipts } from '../../Income/redux/reducer';
import { setCreditCards, setExtraDebts, setFixedDebts } from '../../Outcome/redux/reducer';

const SYNC_STEPS = [
  ['fixed_receipts', setFixedReceipts],
  ['fixed_debts', setFixedDebts],
  ['current_balance', setCurrentBalance],
  ['credit_cards', setCreditCards],
  ['extra_debts', setExtraDebts],
  ['debtors', setDebtors],
  ['debts', setDebts],
  ['extra_receipts', setExtraReceipts],
]

export const syncData = async (dispatch, supabase, user) => {
  try {
    SYNC_STEPS.forEach(async step => {
      let { data } = await supabase
      .from(step[0])
      .select('*')
      .eq('user_uuid', user.id);

      if(step[0] === 'current_balance') dispatch(step[1](data[0].value));
      else dispatch(step[1](data));
    })
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchSetCurrentBalance = async (dispatch, value, supabase, user) => {
  await supabase.from('current_balance').update({ value: value}).eq('user_uuid', user.id);
  dispatch(setCurrentBalance(value));
};
