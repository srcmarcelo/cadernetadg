import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBalance: 0,
  keptBalance: 0,
  userInfo: '',

  willReceive: 0,
  totalDebts: 0,
  totalDebtorsDebts: 0,

  currentDebtorDependency: false,
  monthlyLoss: false,
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
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },

    setWillReceive: (state, action) => {
      state.willReceive = action.payload;
    },
    setTotalDebts: (state, action) => {
      state.totalDebts = action.payload;
    },
    setTotalDebtorsDebts: (state, action) => {
      state.totalDebtorsDebts = action.payload;
    },


    setCurrentDebtorDependency: (state, action) => {
      state.currentDebtorDependency = action.payload;
    },
    setMonthlyLoss: (state, action) => {
      state.monthlyLoss = action.payload;
    },
  },
});

export const {
  setCurrentBalance,
  setKeptBalance,
  setUserInfo,
  setWillReceive,
  setTotalDebts,
  setTotalDebtorsDebts,
  setCurrentDebtorDependency,
  setMonthlyLoss,
} = mainSlice.actions;

export const getCurrentBalance = (state) => state.main.currentBalance;

export const getKeptBalance = (state) => state.main.keptBalance;

export const getUserInfo = (state) => state.main.userInfo;

export const getWillReceive = (state) => state.main.willReceive;
export const getTotalDebts = (state) => state.main.totalDebts;
export const getTotalDebtorsDebts = (state) => state.main.totalDebtorsDebts;

export const getDebtorDependency = (state) => state.main.currentDebtorDependency;
export const getLoss = (state) => state.main.monthlyLoss;

export default mainSlice.reducer;
