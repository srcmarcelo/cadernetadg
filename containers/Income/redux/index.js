import { setCurrentBalance } from './reducer';

export const dispatchSetCurrentBalance = (dispatch, value) => {
  dispatch(setCurrentBalance(value));
};
