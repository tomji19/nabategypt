import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const AUTH_STORAGE_KEY = 'nabat-auth';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, then restart the Vite dev server.'
  );
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl)) {
  console.warn(
    'VITE_SUPABASE_URL looks unusual:',
    supabaseUrl,
    '— expected https://YOUR_PROJECT.supabase.co'
  );
}

export const supabase = createClient(supabaseUrl.replace(/\/$/, ''), supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: AUTH_STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/** Hard-wipe auth keys — signOut alone sometimes leaves a dead JWT that breaks public reads. */
export function wipeAuthStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    for (const key of Object.keys(localStorage)) {
      if (
        key === AUTH_STORAGE_KEY ||
        (key.startsWith('sb-') && key.includes('auth'))
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* private mode */
  }
}

/** Drop a broken local session so requests fall back to the anon key. */
export async function clearLocalSession() {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (err) {
    console.warn('signOut(local) failed:', err?.message || err);
  }
  wipeAuthStorage();
}

export function isAuthJwtError(error) {
  const msg = `${error?.message || ''} ${error?.code || ''} ${error?.status || ''} ${error?.details || ''}`;
  return /jwt|session|expired|invalid.*token|not authenticated|PGRST301|JWS|403|401/i.test(
    msg
  );
}

function sessionStillFresh(session) {
  if (!session?.user || session.user.is_anonymous) return false;
  const expiresAtMs = (session.expires_at || 0) * 1000;
  return Number.isFinite(expiresAtMs) && expiresAtMs > Date.now() + 10_000;
}

/**
 * Call before any public catalog/CMS fetch.
 * Expired / unrefreshable sessions are wiped so the anon key can load the shop.
 */
export async function ensureValidSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('getSession error:', error.message);
    await clearLocalSession();
    return null;
  }
  if (!session?.user) return null;

  if (session.user.is_anonymous) {
    await clearLocalSession();
    return null;
  }

  const expiresAtMs = (session.expires_at || 0) * 1000;
  const needsRefresh = !expiresAtMs || expiresAtMs < Date.now() + 60_000;

  if (!needsRefresh) return session;

  const { data, error: refreshError } = await supabase.auth.refreshSession();
  if (!refreshError && data.session && !data.session.user?.is_anonymous) {
    return data.session;
  }

  // Another tab may have refreshed first (refresh tokens are single-use).
  await new Promise((r) => setTimeout(r, 150));
  const { data: again } = await supabase.auth.getSession();
  if (sessionStillFresh(again?.session)) {
    return again.session;
  }

  console.warn(
    'Session refresh failed — wiping auth storage so the shop can load as guest:',
    refreshError?.message
  );
  await clearLocalSession();
  return null;
}

/**
 * Public data helper: sanitize auth, fetch, and if anything fails retry once as pure anon.
 * This is what "clear localStorage" was doing manually.
 */
export async function withAnonFallback(loader) {
  await ensureValidSession();

  try {
    return await loader();
  } catch (err) {
    console.warn(
      'Public fetch failed — wiping auth and retrying as guest:',
      err?.message || err
    );
    await clearLocalSession();
    return loader();
  }
}
