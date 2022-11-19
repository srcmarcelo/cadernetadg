import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fixedDebts: [],
};

export const outcomeSlice = createSlice({
  name: 'outcome',
  initialState,
  reducers: {
    setFixedDebts: (state, action) => {
      state.fixedDebts = action.payload;
    },
  },
});

export const { setFixedDebts } = outcomeSlice.actions;

export const getFixedDebts = (state) => state.outcome.fixedDebts;

export default outcomeSlice.reducer;
