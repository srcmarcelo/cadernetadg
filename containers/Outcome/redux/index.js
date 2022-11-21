import { setFixedDebts, setOtherDebts } from './reducer';

export const dispatchEditFixedDebts = (dispatch, value) => {
  dispatch(setFixedDebts(value));
};

export const dispatchEditOtherDebts = (dispatch, value) => {
  dispatch(setOtherDebts(value));
};

