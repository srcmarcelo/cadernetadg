import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBalance: 0,
};

export const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setCurrentBalance: (state, action) => {
      state.currentBalance = action.payload;
    },
  },
});

export const { setCurrentBalance } = incomeSlice.actions;

export const getCurrentBalance = (state) => state.income.currentBalance;

export default incomeSlice.reducer;
