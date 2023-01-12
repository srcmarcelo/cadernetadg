import {
  setDebtors,
  setDebtorsError,
  setDebtorsSuccess,
  setDebts,
  setDebtsError,
  setDebtsSuccess,
  setExtraReceipts,
  setExtraReceiptsError,
  setExtraReceiptsSuccess,
  setFixedReceipts,
  setFixedReceiptsError,
  setFixedReceiptsSuccess,
} from './reducer';

export const dispatchEditFixedReceipts = async (
  dispatch,
  values,
  supabase,
  index
) => {
  dispatch(setFixedReceipts());
  try {
    await supabase.from('fixed_receipts').upsert(values[index]);
    dispatch(setFixedReceiptsSuccess(values));
  } catch (error) {
    dispatch(setFixedReceiptsError());
    console.log('error:', error);
  }
};

export const dispatchDeleteFixedReceipt = async (
  dispatch,
  values,
  supabase,
  id
) => {
  dispatch(setFixedReceipts());
  try {
    await supabase.from('fixed_receipts').delete().eq('id', id);
    dispatch(setFixedReceiptsSuccess(values));
  } catch (error) {
    dispatch(setFixedReceiptsError());
    console.log('error:', error);
  }
};

export const dispatchEditDebtors = async (
  dispatch,
  values,
  supabase,
  index
) => {
  dispatch(setDebtors());
  try {
    await supabase.from('debtors').upsert(values[index]);
    dispatch(setDebtorsSuccess(values));
  } catch (error) {
    dispatch(setDebtorsError());
    console.log('error:', error);
  }
};

export const dispatchDeleteDebtor = async (dispatch, values, supabase, id) => {
  dispatch(setDebtors());
  try {
    await supabase.from('debtors').delete().eq('id', id);
    dispatch(setDebtorsSuccess(values));
  } catch (error) {
    dispatch(setDebtorsError());
    console.log('error:', error);
  }
};

export const dispatchFetchDebts = async (dispatch, supabase, user) => {
  dispatch(setDebts());
  try {
    let { data } = await supabase.from('debts').select('*').eq('user_uuid', user.id);
    dispatch(setDebtsSuccess(data));
  } catch (error) {
    dispatch(setDebtsError());
    console.log('error:', error);
  }
};

export const dispatchEditDebts = async (dispatch, values, supabase, index) => {
  dispatch(setDebts());
  try {
    await supabase.from('debts').upsert(values[index]);
    dispatch(setDebtsSuccess(values));
  } catch (error) {
    dispatch(setDebtsError(values));
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
  dispatch(setExtraReceipts());
  try {
    await supabase.from('extra_receipts').upsert(values[index]);
    dispatch(setExtraReceiptsSuccess(values));
  } catch (error) {
    dispatch(setExtraReceiptsError());
    console.log('error:', error);
  }
};

export const dispatchDeleteExtraReceipt = async (
  dispatch,
  values,
  supabase,
  id
) => {
  dispatch(setExtraReceipts());
  try {
    await supabase.from('extra_receipts').delete().eq('id', id);
    dispatch(setExtraReceiptsSuccess(values));
  } catch (error) {
    dispatch(setExtraReceiptsError());
    console.log('error:', error);
  }
};
