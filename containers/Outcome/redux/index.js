import {
  setFixedDebts,
  setExtraDebts,
  setCreditCards,
  setCreditCardsSuccess,
  setCreditCardsError,
  setExtraDebtsError,
  setExtraDebtsSuccess,
  setFixedDebtsSuccess,
  setFixedDebtsError,
} from './reducer';

export const dispatchEditFixedDebts = async (
  dispatch,
  values,
  supabase,
  index
) => {
  dispatch(setFixedDebts());
  try {
    await supabase.from('fixed_debts').upsert(values[index]);
    dispatch(setFixedDebtsSuccess(values));
  } catch (error) {
    dispatch(setFixedDebtsError());
    console.log('error:', error);
  }
};

export const dispatchDeleteFixedDebt = async (
  dispatch,
  values,
  supabase,
  id
) => {
  dispatch(setFixedDebts());
  try {
    await supabase.from('fixed_debts').delete().eq('id', id);
    dispatch(setFixedDebtsSuccess(values));
  } catch (error) {
    dispatch(setFixedDebtsError());
    console.log('error:', error);
  }
};

export const dispatchEditExtraDebts = async (
  dispatch,
  values,
  supabase,
  index
) => {
  dispatch(setExtraDebts());
  try {
    await supabase.from('extra_debts').upsert(values[index]);
    dispatch(setExtraDebtsSuccess(values));
  } catch (error) {
    dispatch(setExtraDebtsError());
    console.log('error:', error);
  }
};

export const dispatchDeleteExtraDebt = async (
  dispatch,
  values,
  supabase,
  id
) => {
  dispatch(setExtraDebts());
  try {
    await supabase.from('extra_debts').delete().eq('id', id);
    dispatch(setExtraDebtsSuccess(values));
  } catch (error) {
    dispatch(setExtraDebtsError());
    console.log('error:', error);
  }
};

export const dispatchEditCreditCards = async (
  dispatch,
  values,
  supabase,
  index
) => {
  dispatch(setCreditCards());
  try {
    await supabase.from('credit_cards').upsert(values[index]);
    dispatch(setCreditCardsSuccess(values));
  } catch (error) {
    dispatch(setCreditCardsError());
    console.log('error:', error);
  }
};

export const dispatchDeleteCreditCard = async (
  dispatch,
  values,
  supabase,
  id
) => {
  dispatch(setCreditCards());
  try {
    await supabase.from('credit_cards').delete().eq('id', id);
    dispatch(setCreditCardsSuccess(values));
  } catch (error) {
    dispatch(setCreditCardsError());
    console.log('error:', error);
  }
};
