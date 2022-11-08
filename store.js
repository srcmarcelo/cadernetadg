import { configureStore } from '@reduxjs/toolkit';
import incomeReducer from './containers/Income/redux/reducer';

export const store = configureStore({
  reducer: {
    income: incomeReducer,
  },
});
