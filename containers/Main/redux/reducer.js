import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBalance: 0,
  keptBalance: 0,
  userInfo: '',

  loadingCurrentBalance: false,
  loadingKeptBalance: false,
  loadingUserInfo: false,

  willReceive: 0,
  totalDebts: 0,
  totalDebtorsDebts: 0,

  currentDebtorDependency: false,
  monthlyLoss: false,

  syncing: false,
  syncError: false,
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setCurrentBalance: (state) => {
      state.loadingCurrentBalance = true;
    },
    setCurrentBalanceSuccess: (state, action) => {
      state.currentBalance = action.payload;
      state.loadingCurrentBalance = false;
    },
    setCurrentBalanceError: (state) => {
      state.loadingCurrentBalance = false;
    },

    setKeptBalance: (state) => {
      state.loadingKeptBalance = true;
    },
    setKeptBalanceSuccess: (state, action) => {
      state.keptBalance = action.payload;
      state.loadingKeptBalance = false;
    },
    setKeptBalanceError: (state) => {
      state.loadingKeptBalance = false;
    },

    setUserInfo: (state) => {
      state.loadingUserInfo = true;
    },
    setUserInfoSuccess: (state, action) => {
      state.userInfo = action.payload;
      state.loadingUserInfo = false;
    },
    setUserInfoError: (state) => {
      state.loadingUserInfo = false;
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

    setSyncing: (state, action) => {
      state.syncing = action.payload;
      state.syncError = false;
    },
    setSyncError: (state) => {
      state.syncError = true;
      state.syncing = false;
    },
  },
});

export const {
  setCurrentBalance,
  setCurrentBalanceSuccess,
  setCurrentBalanceError,

  setKeptBalance,
  setKeptBalanceSuccess,
  setKeptBalanceError,

  setUserInfo,
  setUserInfoSuccess,
  setUserInfoError,

  setWillReceive,
  setTotalDebts,
  setTotalDebtorsDebts,

  setCurrentDebtorDependency,
  setMonthlyLoss,

  setSyncing,
  setSyncError,
} = mainSlice.actions;

export const getCurrentBalance = (state) => state.main.currentBalance;
export const getLoadingCurrentBalance = (state) =>
  state.main.loadingCurrentBalance;

export const getKeptBalance = (state) => state.main.keptBalance;
export const getLoadingKeptBalance = (state) => state.main.loadingKeptBalance;

export const getUserInfo = (state) => state.main.userInfo;
export const getLoadingUserInfo = (state) => state.main.loadingUserInfo;

export const getWillReceive = (state) => state.main.willReceive;
export const getTotalDebts = (state) => state.main.totalDebts;
export const getTotalDebtorsDebts = (state) => state.main.totalDebtorsDebts;

export const getDebtorDependency = (state) =>
  state.main.currentDebtorDependency;
export const getLoss = (state) => state.main.monthlyLoss;

export const getSyncing = (state) => state.main.syncing;
export const getSyncError = (state) => state.main.syncError;

export default mainSlice.reducer;
