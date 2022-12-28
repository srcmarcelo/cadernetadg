import {
  setDebtors,
  setDebts,
  setExtraReceipts,
  setFixedReceipts,
} from './reducer';

export const dispatchEditFixedReceipts = async (
  dispatch,
  values,
  supabase,
  index
) => {
  try {
    await supabase.from('fixed_receipts').upsert(values[index]);
    dispatch(setFixedReceipts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeleteFixedReceipt = async (
  dispatch,
  values,
  supabase,
  id
) => {
  try {
    await supabase.from('fixed_receipts').delete().eq('id', id);
    dispatch(setFixedReceipts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchEditDebtors = async (
  dispatch,
  values,
  supabase,
  index
) => {
  try {
    await supabase.from('debtors').upsert(values[index]);
    dispatch(setDebtors(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeleteDebtor = async (dispatch, values, supabase, id) => {
  try {
    await supabase.from('debtors').delete().eq('id', id);
    dispatch(setDebtors(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchFetchDebts = async (dispatch, supabase, user) => {
  try {
    let { data } = await supabase.from('debts').select('*').eq('user_uuid', user.id);
    dispatch(setDebts(data));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchEditDebts = async (dispatch, values, supabase, index) => {
  try {
    await supabase.from('debts').upsert(values[index]);
    dispatch(setDebts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeleteDebt = async (dispatch, user, supabase, id) => {
  try {
    await supabase.from('debts').delete().eq('id', id);
    await dispatchFetchDebts(dispatch, supabase, user);
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchEditExtraReceipts = async (
  dispatch,
  values,
  supabase,
  index
) => {
  try {
    await supabase.from('extra_receipts').upsert(values[index]);
    dispatch(setExtraReceipts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeleteExtraReceipt = async (
  dispatch,
  values,
  supabase,
  id
) => {
  try {
    await supabase.from('extra_receipts').delete().eq('id', id);
    dispatch(setExtraReceipts(values));
  } catch (error) {
    console.log('error:', error);
  }
};
