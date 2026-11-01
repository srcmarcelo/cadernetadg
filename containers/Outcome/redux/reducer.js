import { createSlice } from '@reduxjs/toolkit';
import { removeRowFromList, upsertRowInList } from '../../../services/syncMerge';

const initialState = {
  fixedDebts: [],
  extraDebts: [],
  creditCards: [],
  cardPurchases: [],

  loadingFixedDebts: false,
  loadingExtraDebts: false,
  loadingCreditCards: false,
  loadingCardPurchases: false,
};

export const outcomeSlice = createSlice({
  name: 'outcome',
  initialState,
  reducers: {
    setFixedDebts: (state) => {
      state.loadingFixedDebts = true;
    },
    setFixedDebtsSuccess: (state, action) => {
      state.fixedDebts = action.payload || [];
      state.loadingFixedDebts = false;
    },
    upsertFixedDebtSuccess: (state, action) => {
      state.fixedDebts = upsertRowInList(state.fixedDebts, action.payload);
      state.loadingFixedDebts = false;
    },
    removeFixedDebtSuccess: (state, action) => {
      state.fixedDebts = removeRowFromList(state.fixedDebts, action.payload);
      state.loadingFixedDebts = false;
    },
    setFixedDebtsError: (state) => {
      state.loadingFixedDebts = false;
    },

    setExtraDebts: (state) => {
      state.loadingExtraDebts = true;
    },
    setExtraDebtsSuccess: (state, action) => {
      state.extraDebts = action.payload || [];
      state.loadingExtraDebts = false;
    },
    upsertExtraDebtSuccess: (state, action) => {
      state.extraDebts = upsertRowInList(state.extraDebts, action.payload);
      state.loadingExtraDebts = false;
    },
    removeExtraDebtSuccess: (state, action) => {
      state.extraDebts = removeRowFromList(state.extraDebts, action.payload);
      state.loadingExtraDebts = false;
    },
    setExtraDebtsError: (state) => {
      state.loadingExtraDebts = false;
    },

    setCreditCards: (state) => {
      state.loadingCreditCards = true;
    },
    setCreditCardsSuccess: (state, action) => {
      state.creditCards = action.payload || [];
      state.loadingCreditCards = false;
    },
    upsertCreditCardSuccess: (state, action) => {
      state.creditCards = upsertRowInList(state.creditCards, action.payload);
      state.loadingCreditCards = false;
    },
    removeCreditCardSuccess: (state, action) => {
      state.creditCards = removeRowFromList(state.creditCards, action.payload);
      state.cardPurchases = state.cardPurchases.filter(
        (p) => p.card_id !== action.payload
      );
      state.loadingCreditCards = false;
    },
    setCreditCardsError: (state) => {
      state.loadingCreditCards = false;
    },

    setCardPurchases: (state) => {
      state.loadingCardPurchases = true;
    },
    setCardPurchasesSuccess: (state, action) => {
      state.cardPurchases = action.payload || [];
      state.loadingCardPurchases = false;
    },
    upsertCardPurchaseSuccess: (state, action) => {
      state.cardPurchases = upsertRowInList(state.cardPurchases, action.payload);
      state.loadingCardPurchases = false;
    },
    upsertManyCardPurchasesSuccess: (state, action) => {
      let next = [...state.cardPurchases];
      (action.payload || []).forEach((row) => {
        next = upsertRowInList(next, row);
      });
      state.cardPurchases = next;
      state.loadingCardPurchases = false;
    },
    removeCardPurchaseSuccess: (state, action) => {
      state.cardPurchases = removeRowFromList(state.cardPurchases, action.payload);
      state.loadingCardPurchases = false;
    },
    setCardPurchasesError: (state) => {
      state.loadingCardPurchases = false;
    },
  },
});

export const {
  setFixedDebts,
  setFixedDebtsSuccess,
  upsertFixedDebtSuccess,
  removeFixedDebtSuccess,
  setFixedDebtsError,

  setExtraDebts,
  setExtraDebtsSuccess,
  upsertExtraDebtSuccess,
  removeExtraDebtSuccess,
  setExtraDebtsError,

  setCreditCards,
  setCreditCardsSuccess,
  upsertCreditCardSuccess,
  removeCreditCardSuccess,
  setCreditCardsError,

  setCardPurchases,
  setCardPurchasesSuccess,
  upsertCardPurchaseSuccess,
  upsertManyCardPurchasesSuccess,
  removeCardPurchaseSuccess,
  setCardPurchasesError,
} = outcomeSlice.actions;

export const getFixedDebts = (state) => state.outcome.fixedDebts;
export const getLoadingFixedDebts = (state) => state.outcome.loadingFixedDebts;

export const getExtraDebts = (state) => state.outcome.extraDebts;
export const getLoadingExtraDebts = (state) => state.outcome.loadingExtraDebts;

export const getCreditCards = (state) => state.outcome.creditCards;
export const getLoadingCreditCards = (state) => state.outcome.loadingCreditCards;

export const getCardPurchases = (state) => state.outcome.cardPurchases;
export const getLoadingCardPurchases = (state) => state.outcome.loadingCardPurchases;

export default outcomeSlice.reducer;
