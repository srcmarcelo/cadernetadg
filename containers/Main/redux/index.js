import {
  setBackgroundSyncing,
  setCurrentBalance,
  setCurrentBalanceError,
  setCurrentBalanceSuccess,
  setHasCardPurchasesTable,
  setKeptBalance,
  setKeptBalanceError,
  setKeptBalanceSuccess,
  setSyncCompleted,
  setSyncError,
  setSyncing,
  setUserInfo,
  setUserInfoError,
  setUserInfoSuccess,
} from './reducer';
import {
  setDebtorsSuccess,
  setDebtsSuccess,
  setExtraReceiptsSuccess,
  setFixedReceiptsSuccess,
} from '../../Income/redux/reducer';
import {
  setCardPurchasesSuccess,
  setCreditCardsSuccess,
  setExtraDebtsSuccess,
  setFixedDebtsSuccess,
} from '../../Outcome/redux/reducer';
import { isMissingTableError } from '../../../services/dbOperations';

function getLocalFallbackPurchases(userId) {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = window.localStorage.getItem(`cadernetadg_cc_purchases_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalFallbackPurchases(userId, list) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    window.localStorage.setItem(
      `cadernetadg_cc_purchases_${userId}`,
      JSON.stringify(list || [])
    );
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Fetches all user financial data concurrently (`Promise.all`) so state is
 * always consistent across devices.
 * When `silent: true`, refreshes in background without showing skeleton/spinner.
 */
export const syncData = async (dispatch, supabase, user, { silent = false } = {}) => {
  if (!supabase || !user?.id) return;

  if (silent) {
    dispatch(setBackgroundSyncing(true));
  } else {
    dispatch(setSyncing(true));
  }

  try {
    const [
      usersRes,
      currentBalRes,
      keptBalRes,
      fixedReceiptsRes,
      fixedDebtsRes,
      creditCardsRes,
      extraDebtsRes,
      debtorsRes,
      debtsRes,
      extraReceiptsRes,
      cardPurchasesRes,
    ] = await Promise.all([
      supabase.from('registered_users').select('*').eq('user_uuid', user.id),
      supabase
        .from('current_balance')
        .select('*')
        .eq('user_uuid', user.id)
        .order('id', { ascending: false }),
      supabase
        .from('kept_balance')
        .select('*')
        .eq('user_uuid', user.id)
        .order('id', { ascending: false }),
      supabase
        .from('fixed_receipts')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('fixed_debts')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('credit_cards')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('extra_debts')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('debtors')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('debts')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('extra_receipts')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('credit_card_purchases')
        .select('*')
        .eq('user_uuid', user.id)
        .order('created_at', { ascending: true }),
    ]);

    // 1. User profile
    if (!usersRes.data || usersRes.data.length === 0) {
      const defaultName = user.user_metadata?.user_name || '';
      await supabase.from('registered_users').insert({
        name: defaultName,
        email: user.email,
        user_uuid: user.id,
      });
      dispatch(setUserInfoSuccess({ name: defaultName, email: user.email }));
    } else {
      dispatch(setUserInfoSuccess(usersRes.data[0]));
    }

    // 2. Current balance (gracefully handles legacy duplicate rows if any)
    if (!currentBalRes.data || currentBalRes.data.length === 0) {
      await supabase.from('current_balance').insert({ value: 0, user_uuid: user.id });
      dispatch(setCurrentBalanceSuccess(0));
    } else {
      dispatch(setCurrentBalanceSuccess(Number(currentBalRes.data[0].value || 0)));
    }

    // 3. Kept balance
    if (!keptBalRes.data || keptBalRes.data.length === 0) {
      await supabase.from('kept_balance').insert({ value: 0, user_uuid: user.id });
      dispatch(setKeptBalanceSuccess(0));
    } else {
      dispatch(setKeptBalanceSuccess(Number(keptBalRes.data[0].value || 0)));
    }

    // 4. Collections
    dispatch(setFixedReceiptsSuccess(fixedReceiptsRes.data || []));
    dispatch(setFixedDebtsSuccess(fixedDebtsRes.data || []));
    dispatch(setCreditCardsSuccess(creditCardsRes.data || []));
    dispatch(setExtraDebtsSuccess(extraDebtsRes.data || []));
    dispatch(setDebtorsSuccess(debtorsRes.data || []));
    dispatch(setDebtsSuccess(debtsRes.data || []));
    dispatch(setExtraReceiptsSuccess(extraReceiptsRes.data || []));

    // 5. Credit card detailed purchases (native table or pre-migration local fallback)
    if (cardPurchasesRes.error && isMissingTableError(cardPurchasesRes.error)) {
      dispatch(setHasCardPurchasesTable(false));
      dispatch(setCardPurchasesSuccess(getLocalFallbackPurchases(user.id)));
    } else {
      dispatch(setHasCardPurchasesTable(true));
      dispatch(setCardPurchasesSuccess(cardPurchasesRes.data || []));
    }

    dispatch(setSyncCompleted(new Date().toISOString()));
  } catch (error) {
    console.error('syncData error:', error);
    dispatch(setSyncError());
  }
};

export const clearData = async (dispatch, supabase, user) => {
  if (!supabase || !user?.id) return;
  dispatch(setSyncing(true));
  try {
    const tablesToClear = [
      'credit_card_purchases',
      'debts',
      'debtors',
      'fixed_receipts',
      'fixed_debts',
      'credit_cards',
      'extra_debts',
      'extra_receipts',
      'current_balance',
      'kept_balance',
    ];

    await Promise.all(
      tablesToClear.map(async (table) => {
        const { error } = await supabase.from(table).delete().eq('user_uuid', user.id);
        if (error && !isMissingTableError(error)) {
          console.error(`Error clearing ${table}:`, error);
        }
      })
    );
    saveLocalFallbackPurchases(user.id, []);
    await syncData(dispatch, supabase, user, { silent: false });
  } catch (error) {
    dispatch(setSyncError());
    console.error('clearData error:', error);
  }
};

export const dispatchSetCurrentBalance = async (
  dispatch,
  value,
  supabase,
  user
) => {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  dispatch(setCurrentBalance());
  try {
    const { data: existing } = await supabase
      .from('current_balance')
      .select('id')
      .eq('user_uuid', user.id);

    if (!existing || existing.length === 0) {
      await supabase
        .from('current_balance')
        .insert({ value: numericValue, user_uuid: user.id });
    } else {
      await supabase
        .from('current_balance')
        .update({ value: numericValue })
        .eq('user_uuid', user.id);
    }
    dispatch(setCurrentBalanceSuccess(numericValue));
  } catch (error) {
    dispatch(setCurrentBalanceError());
  }
};

export const dispatchSetKeptBalance = async (
  dispatch,
  value,
  supabase,
  user
) => {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  dispatch(setKeptBalance());
  try {
    const { data: existing } = await supabase
      .from('kept_balance')
      .select('id')
      .eq('user_uuid', user.id);

    if (!existing || existing.length === 0) {
      await supabase
        .from('kept_balance')
        .insert({ value: numericValue, user_uuid: user.id });
    } else {
      await supabase
        .from('kept_balance')
        .update({ value: numericValue })
        .eq('user_uuid', user.id);
    }
    dispatch(setKeptBalanceSuccess(numericValue));
  } catch (error) {
    dispatch(setKeptBalanceError());
  }
};

export const dispatchSetUserName = async (dispatch, name, supabase, user) => {
  dispatch(setUserInfo());
  try {
    const { data, error } = await supabase
      .from('registered_users')
      .update({ name })
      .eq('user_uuid', user.id)
      .select()
      .single();
    if (error) throw error;
    dispatch(setUserInfoSuccess(data || { name }));
  } catch (error) {
    dispatch(setUserInfoError());
  }
};
