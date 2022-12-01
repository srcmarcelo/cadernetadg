import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedReceipts: [],
};

export const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    setFixedReceipts: (state, action) => {
      state.fixedReceipts = action.payload;
    },
  },
});

export const { setFixedReceipts } = incomeSlice.actions;

export const getFixedReceipts = (state) => state.income.fixedReceipts;

export default incomeSlice.reducer;
