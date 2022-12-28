import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBalance: 0,
  keptBalance: 0,
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setCurrentBalance: (state, action) => {
      state.currentBalance = action.payload;
    },
    setKeptBalance: (state, action) => {
      state.keptBalance = action.payload;
    },
  },
});

export const { setCurrentBalance, setKeptBalance } = mainSlice.actions;

export const getCurrentBalance = (state) => state.main.currentBalance;

export const getKeptBalance = (state) => state.main.keptBalance;

export default mainSlice.reducer;
