import { createSlice } from '@reduxjs/toolkit';
import { removeRowFromList, upsertRowInList } from '../../../services/syncMerge';

const initialState = {
  fixedReceipts: [],
  debtors: [],
  debts: [],
  extraReceipts: [],

  loadingFixedReceipts: false,
  loadingDebtors: false,
  loadingDebts: false,
  loadingExtraReceipts: false,
};

export const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setFixedReceipts: (state) => {
      state.loadingFixedReceipts = true;
    },
    setFixedReceiptsSuccess: (state, action) => {
      state.fixedReceipts = action.payload || [];
      state.loadingFixedReceipts = false;
    },
    upsertFixedReceiptSuccess: (state, action) => {
      state.fixedReceipts = upsertRowInList(state.fixedReceipts, action.payload);
      state.loadingFixedReceipts = false;
    },
    removeFixedReceiptSuccess: (state, action) => {
      state.fixedReceipts = removeRowFromList(state.fixedReceipts, action.payload);
      state.loadingFixedReceipts = false;
    },
    setFixedReceiptsError: (state) => {
      state.loadingFixedReceipts = false;
    },

    setDebtors: (state) => {
      state.loadingDebtors = true;
    },
    setDebtorsSuccess: (state, action) => {
      state.debtors = action.payload || [];
      state.loadingDebtors = false;
    },
    upsertDebtorSuccess: (state, action) => {
      state.debtors = upsertRowInList(state.debtors, action.payload);
      state.loadingDebtors = false;
    },
    removeDebtorSuccess: (state, action) => {
      state.debtors = removeRowFromList(state.debtors, action.payload);
      state.loadingDebtors = false;
    },
    setDebtorsError: (state) => {
      state.loadingDebtors = false;
    },

    setDebts: (state) => {
      state.loadingDebts = true;
    },
    setDebtsSuccess: (state, action) => {
      state.debts = action.payload || [];
      state.loadingDebts = false;
    },
    upsertDebtSuccess: (state, action) => {
      state.debts = upsertRowInList(state.debts, action.payload);
      state.loadingDebts = false;
    },
    removeDebtSuccess: (state, action) => {
      state.debts = removeRowFromList(state.debts, action.payload);
      state.loadingDebts = false;
    },
    setDebtsError: (state) => {
      state.loadingDebts = false;
    },

    setExtraReceipts: (state) => {
      state.loadingExtraReceipts = true;
    },
    setExtraReceiptsSuccess: (state, action) => {
      state.extraReceipts = action.payload || [];
      state.loadingExtraReceipts = false;
    },
    upsertExtraReceiptSuccess: (state, action) => {
      state.extraReceipts = upsertRowInList(state.extraReceipts, action.payload);
      state.loadingExtraReceipts = false;
    },
    removeExtraReceiptSuccess: (state, action) => {
      state.extraReceipts = removeRowFromList(state.extraReceipts, action.payload);
      state.loadingExtraReceipts = false;
    },
    setExtraReceiptsError: (state) => {
      state.loadingExtraReceipts = false;
    },
  },
});

export const {
  setFixedReceipts,
  setFixedReceiptsSuccess,
  upsertFixedReceiptSuccess,
  removeFixedReceiptSuccess,
  setFixedReceiptsError,

  setDebtors,
  setDebtorsSuccess,
  upsertDebtorSuccess,
  removeDebtorSuccess,
  setDebtorsError,

  setDebts,
  setDebtsSuccess,
  upsertDebtSuccess,
  removeDebtSuccess,
  setDebtsError,

  setExtraReceipts,
  setExtraReceiptsSuccess,
  upsertExtraReceiptSuccess,
  removeExtraReceiptSuccess,
  setExtraReceiptsError,
} = incomeSlice.actions;

export const getFixedReceipts = (state) => state.income.fixedReceipts;
export const getLoadingFixedReceipts = (state) => state.income.loadingFixedReceipts;

export const getDebtors = (state) => state.income.debtors;
export const getLoadingDebtors = (state) => state.income.loadingDebtors;

export const getDebts = (state) => state.income.debts;
export const getLoadingDebts = (state) => state.income.loadingDebts;

export const getExtraReceipts = (state) => state.income.extraReceipts;
export const getLoadingExtraReceipts = (state) => state.income.loadingExtraReceipts;

export default incomeSlice.reducer;
