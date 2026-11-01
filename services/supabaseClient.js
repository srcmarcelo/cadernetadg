import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const cleaned = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) return '';
  try {
    return new URL(cleaned).origin;
  } catch {
    return cleaned.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  }
}

let browserSupabaseSingleton = null;

export function getBrowserSupabaseClient() {
  if (browserSupabaseSingleton) return browserSupabaseSingleton;

  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    // Provide a safe placeholder during static build if env vars are absent at build time
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: false },
    });
  }

  browserSupabaseSingleton = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserSupabaseSingleton;
}

const SupabaseContext = createContext({
  supabaseClient: null,
  session: null,
  isLoading: true,
});

export function SupabaseProvider({ children }) {
  const [supabaseClient] = useState(() => getBrowserSupabaseClient());
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(data?.session ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabaseClient]);

  const value = useMemo(
    () => ({
      supabaseClient,
      session,
      isLoading,
    }),
    [supabaseClient, session, isLoading]
  );

  return React.createElement(SupabaseContext.Provider, { value }, children);
}

export function useSessionContext() {
  return useContext(SupabaseContext);
}

export function useSupabaseClient() {
  const ctx = useContext(SupabaseContext);
  return ctx.supabaseClient || getBrowserSupabaseClient();
}

export function useSession() {
  const ctx = useContext(SupabaseContext);
  return ctx.session;
}

export function useUser() {
  const ctx = useContext(SupabaseContext);
  return ctx.session?.user ?? null;
}
