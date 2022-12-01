import { configureStore } from '@reduxjs/toolkit';
import mainReducer from './containers/Main/redux/reducer';
import incomeReducer from './containers/Income/redux/reducer';
import outcomeReducer from './containers/Outcome/redux/reducer';

export const store = configureStore({
  reducer: {
    main: mainReducer,
    income: incomeReducer,
    outcome: outcomeReducer,
  },
});
