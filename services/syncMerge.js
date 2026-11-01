/**
 * Pure conflict-free merge helpers for multi-device synchronization.
 * Ensures that stale in-memory state on Device B never overwrites edits
 * made on Device A.
 */

const LEGACY_ALLOWED_COLUMNS = {
  registered_users: ['id', 'user_uuid', 'name', 'email'],
  current_balance: ['id', 'user_uuid', 'value'],
  kept_balance: ['id', 'user_uuid', 'value'],
  fixed_receipts: ['id', 'user_uuid', 'name', 'value', 'received', 'future_received'],
  fixed_debts: ['id', 'user_uuid', 'name', 'value', 'payed', 'future_payed'],
  credit_cards: [
    'id',
    'user_uuid',
    'name',
    'value',
    'future_value',
    'disabled',
    'future_disabled',
  ],
  extra_debts: [
    'id',
    'user_uuid',
    'name',
    'value',
    'disabled',
    'installments',
    'current_pay',
    'future_pay',
    'future_disabled',
  ],
  debtors: ['id', 'user_uuid', 'name'],
  debts: [
    'id',
    'user_uuid',
    'debtor_id',
    'name',
    'value',
    'installments',
    'current_pay',
    'disabled',
    'future_pay',
    'future_disabled',
  ],
  extra_receipts: [
    'id',
    'user_uuid',
    'name',
    'value',
    'disabled',
    'future_value',
    'future_disabled',
    'future',
  ],
};

/**
 * Deep-merges a single month's patch into the latest server-side JSONB map
 * (`monthly_status` or `monthly_invoices`), preserving all other months and
 * untouched keys written by other devices.
 */
export function mergeMonthlyMap(serverMap, monthKey, monthPatch) {
  const base =
    serverMap && typeof serverMap === 'object' && !Array.isArray(serverMap)
      ? { ...serverMap }
      : {};
  const existingMonth =
    base[monthKey] && typeof base[monthKey] === 'object' && !Array.isArray(base[monthKey])
      ? { ...base[monthKey] }
      : {};

  base[monthKey] = {
    ...existingMonth,
    ...monthPatch,
  };

  return base;
}

/**
 * Filters payload keys when running against a pre-migration Supabase schema
 * so writes never fail with PGRST204 (column not found).
 */
export function sanitizePayloadForSchema(table, payload, hasExtendedColumns = true) {
  if (hasExtendedColumns) return { ...payload };
  const allowed = LEGACY_ALLOWED_COLUMNS[table];
  if (!allowed) return { ...payload };

  const clean = {};
  allowed.forEach((col) => {
    if (payload[col] !== undefined) {
      clean[col] = payload[col];
    }
  });
  return clean;
}

/**
 * Safely merges a single inserted/updated row into a Redux list without
 * overwriting or dropping rows added concurrently on another device.
 */
export function upsertRowInList(list = [], row) {
  if (!row || !row.id) return Array.isArray(list) ? [...list] : [];
  const arr = Array.isArray(list) ? [...list] : [];
  const idx = arr.findIndex((item) => item.id === row.id);
  if (idx === -1) {
    return [...arr, row];
  }
  const merged = [...arr];
  merged[idx] = { ...arr[idx], ...row };
  return merged;
}

/**
 * Safely removes a single deleted ID from a Redux list without affecting
 * any other concurrent rows.
 */
export function removeRowFromList(list = [], id) {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item.id !== id);
}
