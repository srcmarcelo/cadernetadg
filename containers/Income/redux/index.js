import { setCurrentBalance, setFixedReceipts } from './reducer';

export const dispatchSetCurrentBalance = (dispatch, value) => {
  dispatch(setCurrentBalance(value));
};

export const dispatchCreateFixedReceipts = (dispatch, value) => {
  dispatch(setFixedReceipts(value));
};

export const dispatchEditFixedReceipts = (dispatch, value) => {
  dispatch(setFixedReceipts(value));
};

