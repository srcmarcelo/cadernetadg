import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedReceipts: [],
  debtors: [],
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
  },
});

export const { setFixedReceipts, setDebtors } = incomeSlice.actions;

export const getFixedReceipts = (state) => state.income.fixedReceipts;

export const getDebtors = (state) => state.income.debtors;

export default incomeSlice.reducer;
