import React from 'react';
import { setCurrentBalance, setKeptBalance, setUserInfo } from './reducer';
import {
  setDebtors,
  setDebts,
  setExtraReceipts,
  setFixedReceipts,
} from '../../Income/redux/reducer';
import {
  setCreditCards,
  setExtraDebts,
  setFixedDebts,
} from '../../Outcome/redux/reducer';
import _ from 'lodash';

const SYNC_STEPS = [
  ['registered_users', setUserInfo],
  ['current_balance', setCurrentBalance],
  ['kept_balance', setKeptBalance],
  ['fixed_receipts', setFixedReceipts],
  ['fixed_debts', setFixedDebts],
  ['credit_cards', setCreditCards],
  ['extra_debts', setExtraDebts],
  ['debtors', setDebtors],
  ['debts', setDebts],
  ['extra_receipts', setExtraReceipts],
];

export const syncData = async (dispatch, supabase, user) => {
  try {
    SYNC_STEPS.forEach(async (step) => {
      let { data } = await supabase
        .from(step[0])
        .select('*')
        .eq('user_uuid', user.id);

      if (step[0] === 'current_balance') {
        if (_.isEmpty(data)) {
          await supabase
            .from('current_balance')
            .upsert({ value: 0, user_uuid: user.id });
          dispatch(step[1](0));
        } else {
          dispatch(step[1](data[0].value));
        }
      } else if (step[0] === 'kept_balance') {
        if (_.isEmpty(data)) {
          await supabase
            .from('kept_balance')
            .upsert({ value: 0, user_uuid: user.id });
          dispatch(step[1](0));
        } else {
          dispatch(step[1](data[0].value));
        }
      } else if (step[0] === 'registered_users') {
        if (_.isEmpty(data)) {
          await supabase.from('registered_users').upsert({
            name: user.user_metadata.user_name,
            email: user.email,
            user_uuid: user.id,
          });
          dispatch(step[1]({ name: user.user_metadata.user_name }));
        }
      } else dispatch(step[1](data));
    });
  } catch (error) {
    console.log('error:', error);
  }
};

export const clearData = async (supabase, user) => {
  try {
    SYNC_STEPS.forEach(async (step) => {
      await supabase.from(step[0]).delete().eq('user_uuid', user.id);
    });
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchSetCurrentBalance = async (
  dispatch,
  value,
  supabase,
  user
) => {
  await supabase
    .from('current_balance')
    .update({ value: value })
    .eq('user_uuid', user.id);
  dispatch(setCurrentBalance(value));
};

export const dispatchSetKeptBalance = async (
  dispatch,
  value,
  supabase,
  user
) => {
  await supabase
    .from('kept_balance')
    .update({ value: value })
    .eq('user_uuid', user.id);
  dispatch(setKeptBalance(value));
};

export const dispatchSetUserName = async (dispatch, name, supabase, user) => {
  await supabase
    .from('registered_users')
    .update({ name: name })
    .eq('user_uuid', user.id);
  dispatch(setUserInfo({ name: name }));
};
