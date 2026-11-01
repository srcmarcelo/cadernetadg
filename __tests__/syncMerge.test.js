import { describe, expect, it, vi } from 'vitest';
import {
  safeInsertRow,
  safeUpdateMonthlyMap,
  safeUpdateRow,
} from '../services/dbOperations';
import { normalizeSupabaseUrl } from '../services/supabaseClient';
import {
  mergeMonthlyMap,
  removeRowFromList,
  sanitizePayloadForSchema,
  upsertRowInList,
} from '../services/syncMerge';
import { generateUniqueId } from '../utils/id';

describe('Multi-device conflict & data-loss prevention', () => {
  it('generates 1,000 collision-free IDs across un-refreshed devices (replacing sequential getMaxId)', () => {
    const deviceAIds = new Set();
    const deviceBIds = new Set();

    for (let i = 0; i < 500; i += 1) {
      deviceAIds.add(generateUniqueId('user-uuid-123'));
      deviceBIds.add(generateUniqueId('user-uuid-123'));
    }

    expect(deviceAIds.size).toBe(500);
    expect(deviceBIds.size).toBe(500);

    // Zero intersection between Device A and Device B even when both started from identical stale state
    const overlap = [...deviceAIds].filter((id) => deviceBIds.has(id));
    expect(overlap).toHaveLength(0);
  });

  it('deep-merges monthly JSONB maps without erasing edits made on another device', () => {
    // Device A already marked November as paid and adjusted January value on the server
    const serverMapFromDeviceA = {
      '2026-11': { paid: true, value: 450 },
      '2027-01': { paid: false, value: 520 },
    };

    // Un-refreshed Device B marks December as paid
    const mergedAfterDeviceB = mergeMonthlyMap(serverMapFromDeviceA, '2026-12', {
      paid: true,
    });

    expect(mergedAfterDeviceB).toEqual({
      '2026-11': { paid: true, value: 450 },
      '2026-12': { paid: true },
      '2027-01': { paid: false, value: 520 },
    });

    // Device B disables 2026-11 without knowing Device A changed value to 450 -> 450 is preserved!
    const mergedSameMonth = mergeMonthlyMap(serverMapFromDeviceA, '2026-11', {
      disabled: true,
    });
    expect(mergedSameMonth['2026-11']).toEqual({
      paid: true,
      value: 450,
      disabled: true,
    });
  });

  it('upserts and deletes single rows in Redux lists without clobbering concurrent items', () => {
    const initialList = [
      { id: 'u_1', name: 'Internet', value: 120 },
      { id: 'u_2', name: 'Energia', value: 210 },
    ];

    const withAdded = upsertRowInList(initialList, { id: 'u_3', name: 'Água', value: 85 });
    expect(withAdded).toHaveLength(3);

    const withPartialUpdate = upsertRowInList(withAdded, { id: 'u_1', value: 135 });
    expect(withPartialUpdate.find((r) => r.id === 'u_1')).toEqual({
      id: 'u_1',
      name: 'Internet',
      value: 135,
    });

    const afterDelete = removeRowFromList(withPartialUpdate, 'u_2');
    expect(afterDelete.map((r) => r.id)).toEqual(['u_1', 'u_3']);
  });

  it('sanitizes payloads gracefully if SQL migration has not been executed yet', () => {
    const extendedPayload = {
      id: 'u_1',
      user_uuid: 'uuid',
      name: 'Aluguel',
      value: 1800,
      payed: true,
      future_payed: false,
      monthly_status: { '2026-11': { paid: true } },
      updated_at: '2026-11-01T12:00:00Z',
    };

    const legacyClean = sanitizePayloadForSchema('fixed_debts', extendedPayload, false);
    expect(legacyClean).toEqual({
      id: 'u_1',
      user_uuid: 'uuid',
      name: 'Aluguel',
      value: 1800,
      payed: true,
      future_payed: false,
    });
  });

  it('safeUpdateMonthlyMap fetches fresh server JSONB before saving so stale Device B never erases Device A', async () => {
    // Server has Device A's changes in `monthly_status` AND an updated name ('Aluguel Novo')
    const serverRow = {
      id: 'debt_1',
      user_uuid: 'user_1',
      name: 'Aluguel Novo',
      value: 2000,
      payed: true,
      future_payed: false,
      monthly_status: {
        '2026-11': { paid: true },
      },
    };

    const updateSpy = vi.fn((patch) => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(async () => ({
              data: { ...serverRow, ...patch },
              error: null,
            })),
          })),
        })),
      })),
    }));

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(async () => ({ data: serverRow, error: null })),
          })),
        })),
        update: updateSpy,
      })),
    };

    // Un-refreshed Device B (which still had old name 'Aluguel Antigo' and empty monthly_status in memory)
    // toggles 2027-02 to paid:
    const updated = await safeUpdateMonthlyMap({
      supabase: mockSupabase,
      table: 'fixed_debts',
      id: 'debt_1',
      userId: 'user_1',
      mapColumn: 'monthly_status',
      monthKey: '2027-02',
      monthPatch: { paid: true },
    });

    // Verify ONLY `monthly_status` was patched (Device A's `name: 'Aluguel Novo'` and `'2026-11'` were NOT overwritten!)
    expect(updateSpy).toHaveBeenCalledWith({
      monthly_status: {
        '2026-11': { paid: true },
        '2027-02': { paid: true },
      },
    });
    expect(updated.name).toBe('Aluguel Novo');
    expect(updated.monthly_status['2026-11']).toEqual({ paid: true });
    expect(updated.monthly_status['2027-02']).toEqual({ paid: true });
  });

  it('safeInsertRow and safeUpdateRow automatically retry with legacy columns on PGRST204', async () => {
    const insertCalls = [];
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn((payload) => {
          insertCalls.push(payload);
          if (payload.start_month) {
            return {
              select: () => ({
                single: async () => ({
                  data: null,
                  error: {
                    code: 'PGRST204',
                    message: "Could not find the 'start_month' column of 'extra_debts'",
                  },
                }),
              }),
            };
          }
          return {
            select: () => ({
              single: async () => ({ data: payload, error: null }),
            }),
          };
        }),
        update: vi.fn((patch) => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                single: async () => {
                  if (patch.monthly_status) {
                    return {
                      data: null,
                      error: { code: 'PGRST204', message: 'column monthly_status does not exist' },
                    };
                  }
                  return { data: { id: 'ed_1', ...patch }, error: null };
                },
              }),
            }),
          }),
        })),
      })),
    };

    const inserted = await safeInsertRow(mockSupabase, 'extra_debts', {
      id: 'ed_1',
      user_uuid: 'u1',
      name: 'Geladeira',
      value: 300,
      installments: 10,
      current_pay: 1,
      future_pay: 2,
      disabled: false,
      future_disabled: false,
      start_month: '2026-11',
    });

    expect(insertCalls).toHaveLength(2);
    expect(insertCalls[1].start_month).toBeUndefined();
    expect(inserted.start_month).toBe('2026-11');

    const updated = await safeUpdateRow(mockSupabase, 'extra_debts', 'ed_1', 'u1', {
      value: 320,
      monthly_status: { '2026-11': { paid: true } },
    });
    expect(updated.value).toBe(320);
  });

  it('normalizes Supabase URLs even when /rest/v1/ is accidentally appended in env vars', () => {
    expect(normalizeSupabaseUrl('https://bgunmwnaaoooqmqwvpkk.supabase.co/rest/v1/')).toBe(
      'https://bgunmwnaaoooqmqwvpkk.supabase.co'
    );
    expect(normalizeSupabaseUrl('https://bgunmwnaaoooqmqwvpkk.supabase.co/')).toBe(
      'https://bgunmwnaaoooqmqwvpkk.supabase.co'
    );
  });
});
