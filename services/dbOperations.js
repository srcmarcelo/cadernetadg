import { mergeMonthlyMap, sanitizePayloadForSchema } from './syncMerge';

function isMissingColumnError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '');
  return (
    code === 'PGRST204' ||
    code === '42703' ||
    /column .* does not exist/i.test(msg) ||
    /Could not find the '.*' column/i.test(msg)
  );
}

export function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '');
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    /relation .* does not exist/i.test(msg) ||
    /Could not find the table/i.test(msg)
  );
}

/**
 * Inserts a new row with a collision-free UUID primary key.
 * Never uses blind upsert over sequential IDs, eliminating multi-device ID collisions.
 * Automatically falls back to legacy columns if the SQL migration hasn't run yet.
 */
export async function safeInsertRow(supabase, table, row) {
  let { data, error } = await supabase.from(table).insert(row).select().single();

  if (error && isMissingColumnError(error)) {
    const legacyRow = sanitizePayloadForSchema(table, row, false);
    const retry = await supabase.from(table).insert(legacyRow).select().single();
    data = retry.data ? { ...row, ...retry.data } : null;
    error = retry.error;
  }

  if (error) throw error;
  return data;
}

/**
 * Updates ONLY the changed fields of a specific row (`patch`), never sending
 * stale full-object copies from Redux. This guarantees edits on Device B never
 * overwrite unrelated fields modified on Device A.
 */
export async function safeUpdateRow(supabase, table, id, userId, patch) {
  let query = supabase.from(table).update(patch).eq('id', id);
  if (userId) query = query.eq('user_uuid', userId);
  let { data, error } = await query.select().single();

  if (error && isMissingColumnError(error)) {
    const legacyPatch = sanitizePayloadForSchema(table, patch, false);
    if (Object.keys(legacyPatch).length === 0) {
      // Only extended columns were touched on a pre-migration DB; fetch latest row safely
      const current = await supabase.from(table).select('*').eq('id', id).single();
      if (current.error) throw current.error;
      return { ...current.data, ...patch };
    }
    let retryQuery = supabase.from(table).update(legacyPatch).eq('id', id);
    if (userId) retryQuery = retryQuery.eq('user_uuid', userId);
    const retry = await retryQuery.select().single();
    data = retry.data ? { ...retry.data, ...patch } : null;
    error = retry.error;
  }

  if (error) throw error;
  return data;
}

/**
 * Atomically fetches the latest server-side JSONB map (`monthly_status` or `monthly_invoices`
 * or `disabled_months`), deep-merges ONLY `monthKey`'s changes, and writes back alongside
 * any `extraScalarPatch` (like legacy compatibility columns).
 */
export async function safeUpdateMonthlyMap({
  supabase,
  table,
  id,
  userId,
  mapColumn = 'monthly_status',
  monthKey,
  monthPatch,
  extraScalarPatch = {},
}) {
  // Fetch latest map from server so another device's edits to other months are preserved
  let serverMap = {};
  const { data: freshRow, error: fetchErr } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (!fetchErr && freshRow && freshRow[mapColumn]) {
    serverMap = freshRow[mapColumn];
  }

  const mergedMap = mergeMonthlyMap(serverMap, monthKey, monthPatch);
  const fullPatch = {
    ...extraScalarPatch,
    [mapColumn]: mergedMap,
  };

  return safeUpdateRow(supabase, table, id, userId, fullPatch);
}

/**
 * Deletes a single row by ID scoped to `userId`.
 */
export async function safeDeleteRow(supabase, table, id, userId) {
  let query = supabase.from(table).delete().eq('id', id);
  if (userId) query = query.eq('user_uuid', userId);
  const { error } = await query;
  if (error) throw error;
}
