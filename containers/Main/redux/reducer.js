import { createSlice } from '@reduxjs/toolkit';
import { addMonths, getCurrentYearMonth } from '../../../utils/monthUtils';

const initialState = {
  selectedMonth: getCurrentYearMonth(),
  currentBalance: 0,
  keptBalance: 0,
  userInfo: {},

  loadingCurrentBalance: false,
  loadingKeptBalance: false,
  loadingUserInfo: false,

  willReceive: 0,
  totalDebts: 0,
  totalDebtorsDebts: 0,

  currentDebtorDependency: false,
  monthlyLoss: false,

  syncing: true,
  backgroundSyncing: false,
  syncError: false,
  lastSyncedAt: null,
  hasCardPurchasesTable: true,
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    shiftSelectedMonth: (state, action) => {
      state.selectedMonth = addMonths(state.selectedMonth, action.payload);
    },
    resetToCurrentMonth: (state) => {
      state.selectedMonth = getCurrentYearMonth();
    },

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
      state.userInfo = action.payload || {};
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
      if (action.payload) state.syncError = false;
    },
    setBackgroundSyncing: (state, action) => {
      state.backgroundSyncing = action.payload;
    },
    setSyncCompleted: (state, action) => {
      state.syncing = false;
      state.backgroundSyncing = false;
      state.syncError = false;
      state.lastSyncedAt = action.payload || new Date().toISOString();
    },
    setSyncError: (state) => {
      state.syncError = true;
      state.syncing = false;
      state.backgroundSyncing = false;
    },
    setHasCardPurchasesTable: (state, action) => {
      state.hasCardPurchasesTable = Boolean(action.payload);
    },
  },
});

export const {
  setSelectedMonth,
  shiftSelectedMonth,
  resetToCurrentMonth,

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
  setBackgroundSyncing,
  setSyncCompleted,
  setSyncError,
  setHasCardPurchasesTable,
} = mainSlice.actions;

export const getSelectedMonth = (state) => state.main.selectedMonth;
export const getCurrentBalance = (state) => state.main.currentBalance;
export const getLoadingCurrentBalance = (state) => state.main.loadingCurrentBalance;

export const getKeptBalance = (state) => state.main.keptBalance;
export const getLoadingKeptBalance = (state) => state.main.loadingKeptBalance;

export const getUserInfo = (state) => state.main.userInfo;
export const getLoadingUserInfo = (state) => state.main.loadingUserInfo;

export const getWillReceive = (state) => state.main.willReceive;
export const getTotalDebts = (state) => state.main.totalDebts;
export const getTotalDebtorsDebts = (state) => state.main.totalDebtorsDebts;

export const getDebtorDependency = (state) => state.main.currentDebtorDependency;
export const getLoss = (state) => state.main.monthlyLoss;

export const getSyncing = (state) => state.main.syncing;
export const getBackgroundSyncing = (state) => state.main.backgroundSyncing;
export const getSyncError = (state) => state.main.syncError;
export const getLastSyncedAt = (state) => state.main.lastSyncedAt;
export const getHasCardPurchasesTable = (state) => state.main.hasCardPurchasesTable;

export default mainSlice.reducer;
