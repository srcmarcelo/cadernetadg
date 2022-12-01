import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBalance: 0,
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setCurrentBalance: (state, action) => {
      state.currentBalance = action.payload;
    },
  },
});

export const { setCurrentBalance } = mainSlice.actions;

export const getCurrentBalance = (state) => state.main.currentBalance;

export default mainSlice.reducer;
