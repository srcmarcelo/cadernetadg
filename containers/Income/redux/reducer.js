import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBalance: 0,
  fixedReceipts: [],
};

export const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setCurrentBalance: (state, action) => {
      state.currentBalance = action.payload;
    },
    setFixedReceipts: (state, action) => {
      state.fixedReceipts = action.payload;
    },
  },
});

export const { setCurrentBalance, setFixedReceipts } = incomeSlice.actions;

export const getCurrentBalance = (state) => state.income.currentBalance;

export const getFixedReceipts = (state) => state.income.fixedReceipts;

export default incomeSlice.reducer;
