import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

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
    storageKey: 'nabat-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/**
 * Returns a usable session. Refreshes the access token when it is expired
 * or about to expire (uses the refresh token).
 */
export async function ensureValidSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('getSession error:', error.message);
    return null;
  }
  if (!session?.user) return null;

  if (session.user.is_anonymous) {
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }

  const expiresAtMs = (session.expires_at || 0) * 1000;
  const needsRefresh = !expiresAtMs || expiresAtMs < Date.now() + 60_000;

  if (!needsRefresh) return session;

  const { data, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError || !data.session) {
    console.warn('Session refresh failed:', refreshError?.message);
    return null;
  }
  if (data.session.user?.is_anonymous) {
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }
  return data.session;
}
