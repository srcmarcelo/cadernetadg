import React from 'react';
import { setCurrentBalance } from './reducer';
import { setFixedReceipts } from '../../Income/redux/reducer';
import { setFixedDebts } from '../../Outcome/redux/reducer';

const SYNC_STEPS = [
  ['fixed_receipts', setFixedReceipts],
  ['fixed_debts', setFixedDebts],
  ['current_balance', setCurrentBalance],
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
