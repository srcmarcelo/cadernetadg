import { useEffect, useRef } from 'react';
import { syncData } from '../containers/Main/redux';

const WATCHED_TABLES = [
  'current_balance',
  'kept_balance',
  'fixed_receipts',
  'fixed_debts',
  'extra_debts',
  'debtors',
  'debts',
  'extra_receipts',
  'credit_cards',
  'credit_card_purchases',
];

/**
 * Keeps all open devices in sync automatically via:
 * 1. Supabase Realtime (`postgres_changes`)
 * 2. Tab/PWA foreground wakeup (`visibilitychange`, `focus`, `pageshow`, `online`)
 *
 * Uses silent background refresh so active forms and UI never flicker.
 */
export function useRealtimeSync({ dispatch, supabase, user }) {
  const timerRef = useRef(null);
  const lastSyncRef = useRef(0);
  const userRef = useRef(user);
  const userId = user?.id;

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!supabase || !userId) return undefined;

    const triggerSilentSync = (minIntervalMs = 800) => {
      const now = Date.now();
      if (now - lastSyncRef.current < minIntervalMs) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          lastSyncRef.current = Date.now();
          if (userRef.current) {
            syncData(dispatch, supabase, userRef.current, { silent: true });
          }
        }, minIntervalMs);
        return;
      }
      lastSyncRef.current = now;
      if (userRef.current) {
        syncData(dispatch, supabase, userRef.current, { silent: true });
      }
    };

    // 1. Initial full sync on login/mount
    lastSyncRef.current = Date.now();
    if (userRef.current) {
      syncData(dispatch, supabase, userRef.current, { silent: false });
    }

    // 2. Foreground / PWA resume listeners (crucial for mobile PWAs!)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerSilentSync(1000);
      }
    };
    const handleFocus = () => triggerSilentSync(1500);
    const handleOnline = () => triggerSilentSync(500);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);
    window.addEventListener('online', handleOnline);

    // 3. Supabase Realtime subscription scoped to this user
    const channel = supabase.channel(`cadernetadg-sync-${userId}`);
    WATCHED_TABLES.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_uuid=eq.${userId}`,
        },
        () => {
          triggerSilentSync(600);
        }
      );
    });
    channel.subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
      window.removeEventListener('online', handleOnline);
      supabase.removeChannel(channel);
    };
  }, [dispatch, supabase, userId]);
}
