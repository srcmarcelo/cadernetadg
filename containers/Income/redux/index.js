import { setFixedReceipts } from './reducer';

export const dispatchEditFixedReceipts = async (dispatch, values, supabase) => {
  try {
    let { error } = await supabase.from('fixed_receipts').upsert(values[values.length-1]);
    dispatch(setFixedReceipts(values));
  } catch (error) {
    console.log('error:', error);
  }
};

