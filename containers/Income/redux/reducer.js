import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedReceipts: [],
  debtors: [],
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
    setExtraReceipts: (state, action) => {
      state.extraReceipts = action.payload;
    },
  },
});

export const { setFixedReceipts, setDebtors, setExtraReceipts } = incomeSlice.actions;

export const getFixedReceipts = (state) => state.income.fixedReceipts;

export const getDebtors = (state) => state.income.debtors;

export const getExtraReceipts = (state) => state.income.extraReceipts;

export default incomeSlice.reducer;
