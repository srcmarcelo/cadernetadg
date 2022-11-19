import { setFixedDebts } from './reducer';

export const dispatchEditFixedDebts = (dispatch, value) => {
  dispatch(setFixedDebts(value));
};

