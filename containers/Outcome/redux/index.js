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

export const dispatchEditExtraDebts = (dispatch, value) => {
  dispatch(setExtraDebts(value));
};

export const dispatchEditCreditCards = (dispatch, value) => {
  dispatch(setCreditCards(value));
};

