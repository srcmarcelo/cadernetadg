import { configureStore } from '@reduxjs/toolkit';
import incomeReducer from './containers/Income/redux/reducer';
import outcomeReducer from './containers/Outcome/redux/reducer';

export const store = configureStore({
  reducer: {
    income: incomeReducer,
    outcome: outcomeReducer,
  },
});
