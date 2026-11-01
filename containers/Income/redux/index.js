import {
  removeDebtorSuccess,
  removeDebtSuccess,
  removeExtraReceiptSuccess,
  removeFixedReceiptSuccess,
  setDebtors,
  setDebtorsError,
  setDebts,
  setDebtsError,
  setExtraReceipts,
  setExtraReceiptsError,
  setFixedReceipts,
  setFixedReceiptsError,
  upsertDebtorSuccess,
  upsertDebtSuccess,
  upsertExtraReceiptSuccess,
  upsertFixedReceiptSuccess,
} from './reducer';
import {
  safeDeleteRow,
  safeInsertRow,
  safeUpdateMonthlyMap,
  safeUpdateRow,
} from '../../../services/dbOperations';
import { syncData } from '../../Main/redux';
import { addMonths, getCurrentYearMonth } from '../../../utils/monthUtils';
import { generateUniqueId } from '../../../utils/id';
import { roundMoney } from '../../../utils/currency';

/* ============================ FIXED RECEIPTS ============================ */

export const createFixedReceipt = async ({ dispatch, supabase, user, name, value }) => {
  dispatch(setFixedReceipts());
  try {
    const newRow = {
      id: generateUniqueId(user.id),
      user_uuid: user.id,
      name: String(name || '').trim(),
      value: roundMoney(value),
      received: false,
      future_received: false,
      monthly_status: {},
    };
    const saved = await safeInsertRow(supabase, 'fixed_receipts', newRow);
    dispatch(upsertFixedReceiptSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setFixedReceiptsError());
    throw error;
  }
};

export const updateFixedReceipt = async ({ dispatch, supabase, user, id, patch }) => {
  dispatch(setFixedReceipts());
  try {
    const saved = await safeUpdateRow(supabase, 'fixed_receipts', id, user.id, patch);
    dispatch(upsertFixedReceiptSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setFixedReceiptsError());
    throw error;
  }
};

export const updateFixedReceiptMonthStatus = async ({
  dispatch,
  supabase,
  user,
  id,
  selectedMonth,
  monthPatch,
}) => {
  dispatch(setFixedReceipts());
  try {
    const baseMonth = getCurrentYearMonth();
    const nextMonth = addMonths(baseMonth, 1);
    const extraScalarPatch = {};

    if (selectedMonth === baseMonth && monthPatch.received !== undefined) {
      extraScalarPatch.received = Boolean(monthPatch.received);
    } else if (selectedMonth === nextMonth && monthPatch.received !== undefined) {
      extraScalarPatch.future_received = Boolean(monthPatch.received);
    }

    const saved = await safeUpdateMonthlyMap({
      supabase,
      table: 'fixed_receipts',
      id,
      userId: user.id,
      mapColumn: 'monthly_status',
      monthKey: selectedMonth,
      monthPatch,
      extraScalarPatch,
    });
    dispatch(upsertFixedReceiptSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setFixedReceiptsError());
    throw error;
  }
};

export const deleteFixedReceipt = async ({ dispatch, supabase, user, id }) => {
  dispatch(setFixedReceipts());
  try {
    await safeDeleteRow(supabase, 'fixed_receipts', id, user.id);
    dispatch(removeFixedReceiptSuccess(id));
    syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setFixedReceiptsError());
    throw error;
  }
};

/* ============================ DEBTORS & DEBTS ============================ */

export const createDebtor = async ({ dispatch, supabase, user, name, phone = '' }) => {
  dispatch(setDebtors());
  try {
    const newRow = {
      id: generateUniqueId(user.id),
      user_uuid: user.id,
      name: String(name || '').trim(),
      ...(phone ? { phone: String(phone).trim() } : {}),
    };
    const saved = await safeInsertRow(supabase, 'debtors', newRow);
    dispatch(upsertDebtorSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setDebtorsError());
    throw error;
  }
};

export const updateDebtor = async ({ dispatch, supabase, user, id, patch }) => {
  dispatch(setDebtors());
  try {
    const saved = await safeUpdateRow(supabase, 'debtors', id, user.id, patch);
    dispatch(upsertDebtorSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setDebtorsError());
    throw error;
  }
};

export const deleteDebtorAndDebts = async ({ dispatch, supabase, user, debtorId }) => {
  dispatch(setDebtors());
  try {
    await supabase
      .from('debts')
      .delete()
      .eq('debtor_id', debtorId)
      .eq('user_uuid', user.id);
    await safeDeleteRow(supabase, 'debtors', debtorId, user.id);
    dispatch(removeDebtorSuccess(debtorId));
    await syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setDebtorsError());
    throw error;
  }
};

export const createDebtorDebt = async ({
  dispatch,
  supabase,
  user,
  debtorId,
  name,
  value,
  currentInstallment = 1,
  installments = 1,
  selectedMonth,
}) => {
  dispatch(setDebts());
  try {
    const baseMonth = getCurrentYearMonth();
    const curInst = Math.max(1, parseInt(currentInstallment || 1, 10));
    const totalInst = Math.max(curInst, parseInt(installments || 1, 10));
    const startMonth = addMonths(selectedMonth, -(curInst - 1));

    // Legacy compatibility columns for baseMonth / nextMonth
    const currentPayLegacy =
      selectedMonth === baseMonth
        ? curInst
        : selectedMonth === addMonths(baseMonth, 1)
        ? curInst - 1
        : 1;

    const newRow = {
      id: generateUniqueId(debtorId),
      user_uuid: user.id,
      debtor_id: debtorId,
      name: String(name || '').trim(),
      value: roundMoney(value),
      installments: totalInst,
      start_month: startMonth,
      current_pay: currentPayLegacy,
      future_pay: currentPayLegacy + 1,
      disabled: currentPayLegacy < 1,
      future_disabled: false,
      monthly_status: {},
    };

    const saved = await safeInsertRow(supabase, 'debts', newRow);
    dispatch(upsertDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setDebtsError());
    throw error;
  }
};

export const updateDebtorDebt = async ({
  dispatch,
  supabase,
  user,
  id,
  name,
  value,
  currentInstallment,
  installments,
  selectedMonth,
}) => {
  dispatch(setDebts());
  try {
    const baseMonth = getCurrentYearMonth();
    const curInst = Math.max(1, parseInt(currentInstallment || 1, 10));
    const totalInst = Math.max(curInst, parseInt(installments || 1, 10));
    const startMonth = addMonths(selectedMonth, -(curInst - 1));

    const patch = {
      name: String(name || '').trim(),
      value: roundMoney(value),
      installments: totalInst,
      start_month: startMonth,
    };

    if (selectedMonth === baseMonth) {
      patch.current_pay = curInst;
      patch.future_pay = curInst + 1;
    } else if (selectedMonth === addMonths(baseMonth, 1)) {
      patch.future_pay = curInst;
      patch.current_pay = curInst - 1;
    }

    const saved = await safeUpdateRow(supabase, 'debts', id, user.id, patch);
    dispatch(upsertDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setDebtsError());
    throw error;
  }
};

export const updateDebtorDebtMonthStatus = async ({
  dispatch,
  supabase,
  user,
  id,
  selectedMonth,
  monthPatch,
}) => {
  dispatch(setDebts());
  try {
    const baseMonth = getCurrentYearMonth();
    const nextMonth = addMonths(baseMonth, 1);
    const extraScalarPatch = {};

    if (selectedMonth === baseMonth && monthPatch.disabled !== undefined) {
      extraScalarPatch.disabled = Boolean(monthPatch.disabled);
    } else if (selectedMonth === nextMonth && monthPatch.disabled !== undefined) {
      extraScalarPatch.future_disabled = Boolean(monthPatch.disabled);
    }

    const saved = await safeUpdateMonthlyMap({
      supabase,
      table: 'debts',
      id,
      userId: user.id,
      mapColumn: 'monthly_status',
      monthKey: selectedMonth,
      monthPatch,
      extraScalarPatch,
    });
    dispatch(upsertDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setDebtsError());
    throw error;
  }
};

export const deleteDebtorDebt = async ({ dispatch, supabase, user, id }) => {
  dispatch(setDebts());
  try {
    await safeDeleteRow(supabase, 'debts', id, user.id);
    dispatch(removeDebtSuccess(id));
    syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setDebtsError());
    throw error;
  }
};

/* ============================ EXTRA RECEIPTS ============================ */

export const createExtraReceipt = async ({
  dispatch,
  supabase,
  user,
  name,
  value,
  selectedMonth,
}) => {
  dispatch(setExtraReceipts());
  try {
    const baseMonth = getCurrentYearMonth();
    const isNextMonth = selectedMonth === addMonths(baseMonth, 1);
    const amount = roundMoney(value);

    const newRow = {
      id: generateUniqueId(user.id),
      user_uuid: user.id,
      name: String(name || '').trim(),
      value: amount,
      future_value: isNextMonth ? amount : 0,
      target_month: selectedMonth,
      received: false,
      disabled: false,
      future_disabled: !isNextMonth,
      future: isNextMonth,
    };

    const saved = await safeInsertRow(supabase, 'extra_receipts', newRow);
    dispatch(upsertExtraReceiptSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setExtraReceiptsError());
    throw error;
  }
};

export const updateExtraReceipt = async ({
  dispatch,
  supabase,
  user,
  id,
  patch,
  selectedMonth,
}) => {
  dispatch(setExtraReceipts());
  try {
    const baseMonth = getCurrentYearMonth();
    const isNextMonth = selectedMonth === addMonths(baseMonth, 1);
    const fullPatch = { ...patch };

    if (patch.value !== undefined) {
      fullPatch.value = roundMoney(patch.value);
      if (isNextMonth) fullPatch.future_value = roundMoney(patch.value);
    }
    if (patch.disabled !== undefined && isNextMonth) {
      fullPatch.future_disabled = Boolean(patch.disabled);
    }

    const saved = await safeUpdateRow(supabase, 'extra_receipts', id, user.id, fullPatch);
    dispatch(upsertExtraReceiptSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setExtraReceiptsError());
    throw error;
  }
};

export const deleteExtraReceipt = async ({ dispatch, supabase, user, id }) => {
  dispatch(setExtraReceipts());
  try {
    await safeDeleteRow(supabase, 'extra_receipts', id, user.id);
    dispatch(removeExtraReceiptSuccess(id));
    syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setExtraReceiptsError());
    throw error;
  }
};
