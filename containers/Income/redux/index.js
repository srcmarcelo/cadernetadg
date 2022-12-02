import { setFixedReceipts } from './reducer';

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
