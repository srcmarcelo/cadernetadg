import { setFixedDebts, setExtraDebts, setCreditCards } from './reducer';

export const dispatchEditFixedDebts = async (dispatch, values, supabase, index) => {
  try {
    await supabase.from('fixed_debts').upsert(values[index]);
    dispatch(setFixedDebts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeletFixedDebt = async (dispatch, values, supabase, id) => {
  try {
    await supabase.from('fixed_debts').delete().eq('id', id);
    dispatch(setFixedDebts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchEditExtraDebts = async (dispatch, values, supabase, index) => {
  try {
    await supabase.from('extra_debts').upsert(values[index]);
    dispatch(setExtraDebts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeletExtraDebt = async (dispatch, values, supabase, id) => {
  try {
    await supabase.from('extra_debts').delete().eq('id', id);
    dispatch(setExtraDebts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchEditCreditCards = async (dispatch, values, supabase, index) => {
  try {
    await supabase.from('credit_cards').upsert(values[index]);
    dispatch(setCreditCards(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeleteCreditCard = async (dispatch, values, supabase, id) => {
  try {
    await supabase.from('credit_cards').delete().eq('id', id);
    dispatch(setCreditCards(values));
  } catch (error) {
    console.log('error:', error);
  }
};
