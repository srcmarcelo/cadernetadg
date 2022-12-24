import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedReceipts: [],
  debtors: [],
  debts: [],
  extraReceipts: [],
};

export const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setFixedReceipts: (state, action) => {
      state.fixedReceipts = action.payload;
    },
    setDebtors: (state, action) => {
      state.debtors = action.payload;
    },
    setDebts: (state, action) => {
      state.debts = action.payload;
    },
    setExtraReceipts: (state, action) => {
      state.extraReceipts = action.payload;
    },
  },
});

export const { setFixedReceipts, setDebtors, setDebts , setExtraReceipts } = incomeSlice.actions;

export const getFixedReceipts = (state) => state.income.fixedReceipts;

export const getDebtors = (state) => state.income.debtors;

export const getDebts = (state) => state.income.debts;

export const getExtraReceipts = (state) => state.income.extraReceipts;

export default incomeSlice.reducer;
