import { setDebtors, setFixedReceipts } from './reducer';

export const dispatchEditFixedReceipts = async (dispatch, values, supabase, index) => {
  try {
    await supabase.from('fixed_receipts').upsert(values[index]);
    dispatch(setFixedReceipts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeletFixedReceipt = async (dispatch, values, supabase, id) => {
  try {
    await supabase.from('fixed_receipts').delete().eq('id', id);
    dispatch(setFixedReceipts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchEditDebtors = async (dispatch, values, supabase, index) => {
  console.log('values:', values);
  try {
    await supabase.from('debtors').upsert(values[index]);
    dispatch(setDebtors(values));
  } catch (error) {
    console.log('error:', error);
  }
};

export const dispatchDeletDebtor = async (dispatch, values, supabase, id) => {
  try {
    await supabase.from('debtors').delete().eq('id', id);
    dispatch(setDebtors(values));
  } catch (error) {
    console.log('error:', error);
  }
};