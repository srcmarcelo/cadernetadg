import { setCurrentBalance, setFixedReceipts } from './reducer';

export const dispatchSetCurrentBalance = (dispatch, value) => {
  dispatch(setCurrentBalance(value));
};

export const dispatchEditFixedReceipts = (dispatch, value) => {
  dispatch(setFixedReceipts(value));
};

