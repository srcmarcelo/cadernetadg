import { setFixedDebts, setExtraDebts, setCreditCards } from './reducer';

export const dispatchEditFixedDebts = async (dispatch, values, supabase) => {
  try {
    let { error } = await supabase.from('fixed_debts').upsert(values[values.length-1]);
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

