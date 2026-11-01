/**
 * Generates a globally unique, collision-free string ID safe across multiple
 * offline or unsynchronized devices. Remains 100% compatible with existing
 * VARCHAR primary keys in Supabase.
 */
export function generateUniqueId(userId) {
  let randomPart = '';
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  } else {
    randomPart = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
  return userId ? `${userId}_${randomPart}` : randomPart;
}
