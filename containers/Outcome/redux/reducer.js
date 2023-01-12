import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedDebts: [],
  extraDebts: [],
  creditCards: [],

  loadingFixedDebts: false,
  loadingExtraDebts: false,
  loadingCreditCards: false,
};

export const outcomeSlice = createSlice({
  name: 'outcome',
  initialState,
  reducers: {
    setFixedDebts: (state) => {
      state.loadingFixedDebts = true;
    },
    setFixedDebtsSuccess: (state, action) => {
      state.fixedDebts = action.payload;
      state.loadingFixedDebts = false;
    },
    setFixedDebtsError: (state) => {
      state.loadingFixedDebts = false;
    },

    setExtraDebts: (state) => {
      state.loadingExtraDebts = true;
    },
    setExtraDebtsSuccess: (state, action) => {
      state.extraDebts = action.payload;
      state.loadingExtraDebts = false;
    },
    setExtraDebtsError: (state) => {
      state.loadingExtraDebts = false;
    },

    setCreditCards: (state) => {
      state.loadingCreditCards = true;
    },
    setCreditCardsSuccess: (state, action) => {
      state.creditCards = action.payload;
      state.loadingCreditCards = false;
    },
    setCreditCardsError: (state) => {
      state.loadingCreditCards = false;
    },
  },
});

export const {
  setFixedDebts,
  setFixedDebtsSuccess,
  setFixedDebtsError,
  setExtraDebts,
  setExtraDebtsSuccess,
  setExtraDebtsError,
  setCreditCards,
  setCreditCardsSuccess,
  setCreditCardsError,
} = outcomeSlice.actions;

export const getFixedDebts = (state) => state.outcome.fixedDebts;
export const getLoadingFixedDebts = (state) => state.outcome.loadingFixedDebts;

export const getExtraDebts = (state) => state.outcome.extraDebts;
export const getLoadingExtraDebts = (state) => state.outcome.loadingExtraDebts;

export const getCreditCards = (state) => state.outcome.creditCards;
export const getLoadingCreditCards = (state) => state.outcome.loadingCreditCards;

export default outcomeSlice.reducer;
