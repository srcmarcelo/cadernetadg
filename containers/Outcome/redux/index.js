import {
  removeCardPurchaseSuccess,
  removeCreditCardSuccess,
  removeExtraDebtSuccess,
  removeFixedDebtSuccess,
  setCardPurchases,
  setCardPurchasesError,
  setCreditCards,
  setCreditCardsError,
  setExtraDebts,
  setExtraDebtsError,
  setFixedDebts,
  setFixedDebtsError,
  upsertCardPurchaseSuccess,
  upsertCreditCardSuccess,
  upsertExtraDebtSuccess,
  upsertFixedDebtSuccess,
  upsertManyCardPurchasesSuccess,
} from './reducer';
import {
  isMissingTableError,
  safeDeleteRow,
  safeInsertRow,
  safeUpdateMonthlyMap,
  safeUpdateRow,
} from '../../../services/dbOperations';
import { saveLocalFallbackPurchases, syncData } from '../../Main/redux';
import { addMonths, getCurrentYearMonth } from '../../../utils/monthUtils';
import { generateUniqueId } from '../../../utils/id';
import { roundMoney } from '../../../utils/currency';
import { setHasCardPurchasesTable } from '../../Main/redux/reducer';

/* ============================ FIXED DEBTS ============================ */

export const createFixedDebt = async ({ dispatch, supabase, user, name, value }) => {
  dispatch(setFixedDebts());
  try {
    const newRow = {
      id: generateUniqueId(user.id),
      user_uuid: user.id,
      name: String(name || '').trim(),
      value: roundMoney(value),
      payed: false,
      future_payed: false,
      monthly_status: {},
    };
    const saved = await safeInsertRow(supabase, 'fixed_debts', newRow);
    dispatch(upsertFixedDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setFixedDebtsError());
    throw error;
  }
};

export const updateFixedDebt = async ({ dispatch, supabase, user, id, patch }) => {
  dispatch(setFixedDebts());
  try {
    const saved = await safeUpdateRow(supabase, 'fixed_debts', id, user.id, patch);
    dispatch(upsertFixedDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setFixedDebtsError());
    throw error;
  }
};

export const updateFixedDebtMonthStatus = async ({
  dispatch,
  supabase,
  user,
  id,
  selectedMonth,
  monthPatch,
}) => {
  dispatch(setFixedDebts());
  try {
    const baseMonth = getCurrentYearMonth();
    const nextMonth = addMonths(baseMonth, 1);
    const extraScalarPatch = {};

    if (selectedMonth === baseMonth && monthPatch.paid !== undefined) {
      extraScalarPatch.payed = Boolean(monthPatch.paid);
    } else if (selectedMonth === nextMonth && monthPatch.paid !== undefined) {
      extraScalarPatch.future_payed = Boolean(monthPatch.paid);
    }

    const saved = await safeUpdateMonthlyMap({
      supabase,
      table: 'fixed_debts',
      id,
      userId: user.id,
      mapColumn: 'monthly_status',
      monthKey: selectedMonth,
      monthPatch,
      extraScalarPatch,
    });
    dispatch(upsertFixedDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setFixedDebtsError());
    throw error;
  }
};

export const deleteFixedDebt = async ({ dispatch, supabase, user, id }) => {
  dispatch(setFixedDebts());
  try {
    await safeDeleteRow(supabase, 'fixed_debts', id, user.id);
    dispatch(removeFixedDebtSuccess(id));
    syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setFixedDebtsError());
    throw error;
  }
};

/* ============================ EXTRA DEBTS ============================ */

export const createExtraDebt = async ({
  dispatch,
  supabase,
  user,
  name,
  value,
  currentInstallment = 1,
  installments = 1,
  selectedMonth,
}) => {
  dispatch(setExtraDebts());
  try {
    const baseMonth = getCurrentYearMonth();
    const curInst = Math.max(1, parseInt(currentInstallment || 1, 10));
    const totalInst = Math.max(curInst, parseInt(installments || 1, 10));
    const startMonth = addMonths(selectedMonth, -(curInst - 1));

    const currentPayLegacy =
      selectedMonth === baseMonth
        ? curInst
        : selectedMonth === addMonths(baseMonth, 1)
        ? curInst - 1
        : 1;

    const newRow = {
      id: generateUniqueId(user.id),
      user_uuid: user.id,
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

    const saved = await safeInsertRow(supabase, 'extra_debts', newRow);
    dispatch(upsertExtraDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setExtraDebtsError());
    throw error;
  }
};

export const updateExtraDebt = async ({
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
  dispatch(setExtraDebts());
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

    const saved = await safeUpdateRow(supabase, 'extra_debts', id, user.id, patch);
    dispatch(upsertExtraDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setExtraDebtsError());
    throw error;
  }
};

export const updateExtraDebtMonthStatus = async ({
  dispatch,
  supabase,
  user,
  id,
  selectedMonth,
  monthPatch,
}) => {
  dispatch(setExtraDebts());
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
      table: 'extra_debts',
      id,
      userId: user.id,
      mapColumn: 'monthly_status',
      monthKey: selectedMonth,
      monthPatch,
      extraScalarPatch,
    });
    dispatch(upsertExtraDebtSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setExtraDebtsError());
    throw error;
  }
};

export const deleteExtraDebt = async ({ dispatch, supabase, user, id }) => {
  dispatch(setExtraDebts());
  try {
    await safeDeleteRow(supabase, 'extra_debts', id, user.id);
    dispatch(removeExtraDebtSuccess(id));
    syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setExtraDebtsError());
    throw error;
  }
};

/* ============================ CREDIT CARDS ============================ */

export const createCreditCard = async ({
  dispatch,
  supabase,
  user,
  name,
  manualValue = 0,
  dueDay = null,
  closingDay = null,
  cardLimit = null,
  selectedMonth,
}) => {
  dispatch(setCreditCards());
  try {
    const baseMonth = getCurrentYearMonth();
    const nextMonth = addMonths(baseMonth, 1);
    const val = roundMoney(manualValue || 0);

    const monthlyInvoices =
      val > 0 && selectedMonth
        ? { [selectedMonth]: { manual_total: val, paid: false, disabled: false } }
        : {};

    const newCard = {
      id: generateUniqueId(user.id),
      user_uuid: user.id,
      name: String(name || '').trim(),
      value: selectedMonth === baseMonth ? val : 0,
      future_value: selectedMonth === nextMonth ? val : 0,
      disabled: false,
      future_disabled: false,
      due_day: dueDay || null,
      closing_day: closingDay || null,
      card_limit: cardLimit ? roundMoney(cardLimit) : null,
      monthly_invoices: monthlyInvoices,
    };

    const saved = await safeInsertRow(supabase, 'credit_cards', newCard);
    dispatch(upsertCreditCardSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setCreditCardsError());
    throw error;
  }
};

export const updateCreditCardInfo = async ({ dispatch, supabase, user, id, patch }) => {
  dispatch(setCreditCards());
  try {
    const saved = await safeUpdateRow(supabase, 'credit_cards', id, user.id, patch);
    dispatch(upsertCreditCardSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setCreditCardsError());
    throw error;
  }
};

export const updateCreditCardMonthInvoice = async ({
  dispatch,
  supabase,
  user,
  id,
  selectedMonth,
  monthPatch,
}) => {
  dispatch(setCreditCards());
  try {
    const baseMonth = getCurrentYearMonth();
    const nextMonth = addMonths(baseMonth, 1);
    const extraScalarPatch = {};

    if (selectedMonth === baseMonth) {
      if (monthPatch.manual_total !== undefined && monthPatch.manual_total !== null) {
        extraScalarPatch.value = roundMoney(monthPatch.manual_total);
      }
      if (monthPatch.disabled !== undefined) {
        extraScalarPatch.disabled = Boolean(monthPatch.disabled);
      }
    } else if (selectedMonth === nextMonth) {
      if (monthPatch.manual_total !== undefined && monthPatch.manual_total !== null) {
        extraScalarPatch.future_value = roundMoney(monthPatch.manual_total);
      }
      if (monthPatch.disabled !== undefined) {
        extraScalarPatch.future_disabled = Boolean(monthPatch.disabled);
      }
    }

    const saved = await safeUpdateMonthlyMap({
      supabase,
      table: 'credit_cards',
      id,
      userId: user.id,
      mapColumn: 'monthly_invoices',
      monthKey: selectedMonth,
      monthPatch,
      extraScalarPatch,
    });
    dispatch(upsertCreditCardSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    dispatch(setCreditCardsError());
    throw error;
  }
};

export const deleteCreditCard = async ({ dispatch, supabase, user, id }) => {
  dispatch(setCreditCards());
  try {
    // Also clean up purchases if table exists
    const { error: pErr } = await supabase
      .from('credit_card_purchases')
      .delete()
      .eq('card_id', id)
      .eq('user_uuid', user.id);
    if (pErr && !isMissingTableError(pErr)) {
      console.error('Error deleting card purchases:', pErr);
    }

    await safeDeleteRow(supabase, 'credit_cards', id, user.id);
    dispatch(removeCreditCardSuccess(id));
    syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setCreditCardsError());
    throw error;
  }
};

/* ============================ CREDIT CARD PURCHASES ============================ */

export const createCardPurchase = async ({
  dispatch,
  getState,
  supabase,
  user,
  cardId,
  name,
  category = 'Outros',
  purchaseDate = '',
  value,
  currentInstallment = 1,
  installments = 1,
  isRecurring = false,
  selectedMonth,
  source = 'manual',
}) => {
  dispatch(setCardPurchases());
  try {
    const curInst = isRecurring ? 1 : Math.max(1, parseInt(currentInstallment || 1, 10));
    const totalInst = isRecurring ? 1 : Math.max(curInst, parseInt(installments || 1, 10));
    const startMonth = isRecurring
      ? selectedMonth
      : addMonths(selectedMonth, -(curInst - 1));
    const monthlyVal = roundMoney(value);

    const newRow = {
      id: generateUniqueId(cardId),
      user_uuid: user.id,
      card_id: cardId,
      name: String(name || '').trim(),
      category: category || 'Outros',
      purchase_date: purchaseDate || '',
      value: monthlyVal,
      total_value: roundMoney(monthlyVal * totalInst),
      installments: totalInst,
      start_month: startMonth,
      is_recurring: Boolean(isRecurring),
      disabled_months: {},
      source,
    };

    const { data, error } = await supabase
      .from('credit_card_purchases')
      .insert(newRow)
      .select()
      .single();

    if (error && isMissingTableError(error)) {
      dispatch(setHasCardPurchasesTable(false));
      dispatch(upsertCardPurchaseSuccess(newRow));
      if (getState) {
        saveLocalFallbackPurchases(user.id, getState().outcome.cardPurchases);
      }
      return newRow;
    }
    if (error) throw error;

    dispatch(upsertCardPurchaseSuccess(data));
    syncData(dispatch, supabase, user, { silent: true });
    return data;
  } catch (error) {
    dispatch(setCardPurchasesError());
    throw error;
  }
};

export const batchImportCardPurchases = async ({
  dispatch,
  getState,
  supabase,
  user,
  cardId,
  items = [],
  invoiceMonth,
  manualAdjustment = 0,
  computedMonthTotal = null,
  dueDay = null,
  closingDay = null,
}) => {
  dispatch(setCardPurchases());
  try {
    const rows = items.map((it) => {
      const curInst = it.is_recurring
        ? 1
        : Math.max(1, parseInt(it.current_installment || 1, 10));
      const totalInst = it.is_recurring
        ? 1
        : Math.max(curInst, parseInt(it.installments || 1, 10));
      const startMonth = it.is_recurring
        ? invoiceMonth
        : addMonths(invoiceMonth, -(curInst - 1));
      const monthlyVal = roundMoney(it.value);

      return {
        id: generateUniqueId(cardId),
        user_uuid: user.id,
        card_id: cardId,
        name: String(it.name || 'Compra').trim(),
        category: it.category || 'Outros',
        purchase_date: it.purchase_date || '',
        value: monthlyVal,
        total_value: roundMoney(monthlyVal * totalInst),
        installments: totalInst,
        start_month: startMonth,
        is_recurring: Boolean(it.is_recurring),
        disabled_months: {},
        source: 'ai_import',
      };
    });

    if (rows.length > 0) {
      const { data, error } = await supabase
        .from('credit_card_purchases')
        .insert(rows)
        .select();

      if (error && isMissingTableError(error)) {
        dispatch(setHasCardPurchasesTable(false));
        dispatch(upsertManyCardPurchasesSuccess(rows));
        if (getState) {
          saveLocalFallbackPurchases(user.id, getState().outcome.cardPurchases);
        }
      } else if (error) {
        throw error;
      } else {
        dispatch(upsertManyCardPurchasesSuccess(data || rows));
      }
    }

    // Update card metadata (dueDay, closingDay, optional adjustment)
    const cardScalarPatch = {};
    if (dueDay) cardScalarPatch.due_day = dueDay;
    if (closingDay) cardScalarPatch.closing_day = closingDay;

    if (Object.keys(cardScalarPatch).length > 0) {
      await safeUpdateRow(supabase, 'credit_cards', cardId, user.id, cardScalarPatch);
    }

    const totalForLegacy =
      computedMonthTotal !== null
        ? roundMoney(computedMonthTotal)
        : roundMoney(
            rows.reduce((acc, r) => acc + r.value, 0) + roundMoney(manualAdjustment || 0)
          );

    await updateCreditCardMonthInvoice({
      dispatch,
      supabase,
      user,
      id: cardId,
      selectedMonth: invoiceMonth,
      monthPatch: {
        manual_total: totalForLegacy,
        manual_adjustment: roundMoney(manualAdjustment || 0),
        override_total: false,
      },
    });

    await syncData(dispatch, supabase, user, { silent: true });
    return rows;
  } catch (error) {
    dispatch(setCardPurchasesError());
    throw error;
  }
};

export const updateCardPurchase = async ({
  dispatch,
  getState,
  supabase,
  user,
  id,
  name,
  category,
  purchaseDate,
  value,
  currentInstallment,
  installments,
  isRecurring,
  selectedMonth,
}) => {
  dispatch(setCardPurchases());
  try {
    const curInst = isRecurring ? 1 : Math.max(1, parseInt(currentInstallment || 1, 10));
    const totalInst = isRecurring ? 1 : Math.max(curInst, parseInt(installments || 1, 10));
    const startMonth = isRecurring
      ? selectedMonth
      : addMonths(selectedMonth, -(curInst - 1));
    const monthlyVal = roundMoney(value);

    const patch = {
      name: String(name || '').trim(),
      category: category || 'Outros',
      purchase_date: purchaseDate || '',
      value: monthlyVal,
      total_value: roundMoney(monthlyVal * totalInst),
      installments: totalInst,
      start_month: startMonth,
      is_recurring: Boolean(isRecurring),
    };

    const { data, error } = await supabase
      .from('credit_card_purchases')
      .update(patch)
      .eq('id', id)
      .eq('user_uuid', user.id)
      .select()
      .single();

    if (error && isMissingTableError(error)) {
      dispatch(upsertCardPurchaseSuccess({ id, ...patch }));
      if (getState) {
        saveLocalFallbackPurchases(user.id, getState().outcome.cardPurchases);
      }
      return { id, ...patch };
    }
    if (error) throw error;

    dispatch(upsertCardPurchaseSuccess(data));
    syncData(dispatch, supabase, user, { silent: true });
    return data;
  } catch (error) {
    dispatch(setCardPurchasesError());
    throw error;
  }
};

export const toggleCardPurchaseMonthDisabled = async ({
  dispatch,
  getState,
  supabase,
  user,
  id,
  selectedMonth,
  disabled,
}) => {
  dispatch(setCardPurchases());
  try {
    const saved = await safeUpdateMonthlyMap({
      supabase,
      table: 'credit_card_purchases',
      id,
      userId: user.id,
      mapColumn: 'disabled_months',
      monthKey: selectedMonth,
      monthPatch: { disabled: Boolean(disabled) },
    });
    dispatch(upsertCardPurchaseSuccess(saved));
    syncData(dispatch, supabase, user, { silent: true });
    return saved;
  } catch (error) {
    if (isMissingTableError(error) && getState) {
      const existing = getState().outcome.cardPurchases.find((p) => p.id === id);
      if (existing) {
        const nextMap = {
          ...(existing.disabled_months || {}),
          [selectedMonth]: { disabled: Boolean(disabled) },
        };
        dispatch(upsertCardPurchaseSuccess({ ...existing, disabled_months: nextMap }));
        saveLocalFallbackPurchases(user.id, getState().outcome.cardPurchases);
      }
      return null;
    }
    dispatch(setCardPurchasesError());
    throw error;
  }
};

export const deleteCardPurchase = async ({
  dispatch,
  getState,
  supabase,
  user,
  id,
}) => {
  dispatch(setCardPurchases());
  try {
    const { error } = await supabase
      .from('credit_card_purchases')
      .delete()
      .eq('id', id)
      .eq('user_uuid', user.id);

    if (error && isMissingTableError(error)) {
      dispatch(removeCardPurchaseSuccess(id));
      if (getState) {
        saveLocalFallbackPurchases(user.id, getState().outcome.cardPurchases);
      }
      return;
    }
    if (error) throw error;

    dispatch(removeCardPurchaseSuccess(id));
    syncData(dispatch, supabase, user, { silent: true });
  } catch (error) {
    dispatch(setCardPurchasesError());
    throw error;
  }
};
