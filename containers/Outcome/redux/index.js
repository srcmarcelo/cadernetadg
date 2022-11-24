import { setFixedDebts, setExtraDebts, setCreditCards } from './reducer';

export const dispatchEditFixedDebts = (dispatch, value) => {
  dispatch(setFixedDebts(value));
};

export const dispatchEditExtraDebts = (dispatch, value) => {
  dispatch(setExtraDebts(value));
};

export const dispatchEditCreditCards = (dispatch, value) => {
  dispatch(setCreditCards(value));
};

