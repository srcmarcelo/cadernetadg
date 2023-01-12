import React from 'react';
import {
  setCurrentBalance,
  setCurrentBalanceError,
  setCurrentBalanceSuccess,
  setKeptBalance,
  setKeptBalanceError,
  setKeptBalanceSuccess,
  setSyncError,
  setSyncing,
  setUserInfo,
  setUserInfoError,
  setUserInfoSuccess,
} from './reducer';
import {
  setDebtorsSuccess,
  setDebtsSuccess,
  setExtraReceiptsSuccess,
  setFixedReceiptsSuccess,
} from '../../Income/redux/reducer';
import {
  setCreditCardsSuccess,
  setExtraDebtsSuccess,
  setFixedDebtsSuccess,
} from '../../Outcome/redux/reducer';
import _ from 'lodash';

const SYNC_STEPS = [
  ['registered_users', setUserInfoSuccess],
  ['current_balance', setCurrentBalanceSuccess],
  ['kept_balance', setKeptBalanceSuccess],
  ['fixed_receipts', setFixedReceiptsSuccess],
  ['fixed_debts', setFixedDebtsSuccess],
  ['credit_cards', setCreditCardsSuccess],
  ['extra_debts', setExtraDebtsSuccess],
  ['debtors', setDebtorsSuccess],
  ['debts', setDebtsSuccess],
  ['extra_receipts', setExtraReceiptsSuccess],
];

export const syncData = async (dispatch, supabase, user) => {
  dispatch(setSyncing(true));
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

      if (step[0] === 'extra_receipts') {
        dispatch(setSyncing(false));
      }
    });
  } catch (error) {
    dispatch(setSyncError());
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
  dispatch(setCurrentBalance());
  try {
    await supabase
      .from('current_balance')
      .update({ value: value })
      .eq('user_uuid', user.id);
    dispatch(setCurrentBalanceSuccess(value));
  } catch (error) {
    dispatch(setCurrentBalanceError());
  }
};

export const dispatchSetKeptBalance = async (
  dispatch,
  value,
  supabase,
  user
) => {
  dispatch(setKeptBalance());
  try {
    await supabase
      .from('kept_balance')
      .update({ value: value })
      .eq('user_uuid', user.id);
    dispatch(setKeptBalanceSuccess(value));
  } catch (error) {
    dispatch(setKeptBalanceError());
  }
};

export const dispatchSetUserName = async (dispatch, name, supabase, user) => {
  dispatch(setUserInfo());
  try {
    await supabase
      .from('registered_users')
      .update({ name: name })
      .eq('user_uuid', user.id);
    dispatch(setUserInfoSuccess({ name: name }));
  } catch (error) {
    dispatch(setUserInfoError());
  }
};
