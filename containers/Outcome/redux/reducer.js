import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedDebts: [],
  extraDebts: [],
  creditCards: [],
};

export const outcomeSlice = createSlice({
  name: 'outcome',
  initialState,
  reducers: {
    setFixedDebts: (state, action) => {
      state.fixedDebts = action.payload;
    },
    setExtraDebts: (state, action) => {
      state.extraDebts = action.payload;
    },
    setCreditCards: (state, action) => {
      state.creditCards = action.payload;
    },
  },
});

export const { setFixedDebts, setExtraDebts, setCreditCards } = outcomeSlice.actions;

export const getFixedDebts = (state) => state.outcome.fixedDebts;

export const getExtraDebts = (state) => state.outcome.extraDebts;

export const getCreditCards = (state) => state.outcome.creditCards;

export default outcomeSlice.reducer;
