import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedDebts: [],
  otherDebts: [],
};

export const outcomeSlice = createSlice({
  name: 'outcome',
  initialState,
  reducers: {
    setFixedDebts: (state, action) => {
      state.fixedDebts = action.payload;
    },
    setOtherDebts: (state, action) => {
      state.otherDebts = action.payload;
    },
  },
});

export const { setFixedDebts, setOtherDebts } = outcomeSlice.actions;

export const getFixedDebts = (state) => state.outcome.fixedDebts;

export const getOtherDebts = (state) => state.outcome.otherDebts;

export default outcomeSlice.reducer;
