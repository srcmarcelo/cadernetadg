import { createSlice } from '@reduxjs/toolkit';

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
      state.fixedReceipts = action.payload;
      state.loadingFixedReceipts = false;
    },
    setFixedReceiptsError: (state) => {
      state.loadingFixedReceipts = false;
    },

    setDebtors: (state) => {
      state.loadingDebtors = true;
    },
    setDebtorsSuccess: (state, action) => {
      state.debtors = action.payload;
      state.loadingDebtors = false;
    },
    setDebtorsError: (state) => {
      state.loadingDebtors = false;
    },

    setDebts: (state) => {
      state.loadingDebts = true;
    },
    setDebtsSuccess: (state, action) => {
      state.debts = action.payload;
      state.loadingDebts = false;
    },
    setDebtsError: (state) => {
      state.loadingDebts = false;
    },

    setExtraReceipts: (state) => {
      state.loadingExtraReceipts = true;
    },
    setExtraReceiptsSuccess: (state, action) => {
      state.extraReceipts = action.payload;
      state.loadingExtraReceipts = false;
    },
    setExtraReceiptsError: (state, action) => {
      state.extraReceipts = action.payload;
      state.loadingExtraReceipts = false;
    },
  },
});

export const {
  setFixedReceipts,
  setFixedReceiptsSuccess,
  setFixedReceiptsError,

  setDebtors,
  setDebtorsSuccess,
  setDebtorsError,

  setDebts,
  setDebtsSuccess,
  setDebtsError,

  setExtraReceipts,
  setExtraReceiptsSuccess,
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
