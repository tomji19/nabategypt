/* @refresh reload */
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  supabase,
  clearLocalSession,
  ensureValidSession,
} from '../../supabase/supabase';
import { doSignOut } from '../../supabase/auth';
import PlantLoader from '../PlantLoader/PlantLoader';

const AuthContext = React.createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function toAppUser(user) {
  if (!user?.id || user.is_anonymous) return null;
  return {
    uid: user.id,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
  };
}

async function fetchOrCreateProfile(user) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!error && profile) return profile;

  if (error && error.code !== 'PGRST116') {
    console.warn('Profile fetch error:', error.message);
  }

  const { data: created, error: createError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email || null,
        name: user.user_metadata?.name || user.user_metadata?.fullname || '',
        fullname: user.user_metadata?.fullname || user.user_metadata?.name || '',
        login_method: 'email',
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (createError) {
    console.warn('Profile create error:', createError.message);
    return {
      email: user.email,
      name: user.user_metadata?.name || '',
      fullname: user.user_metadata?.fullname || '',
    };
  }
  return created;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  /** Block catalog providers until dead JWT is wiped — same effect as clearing localStorage. */
  const [storageReady, setStorageReady] = useState(false);
  const profileUserRef = useRef(null);

  const clearAuthState = useCallback(() => {
    profileUserRef.current = null;
    setCurrentUser(null);
    setUserDetails(null);
    setUserLoggedIn(false);
  }, []);

  const applySessionUser = useCallback(
    async (user, { loadProfile = true } = {}) => {
      if (!user || user.is_anonymous) {
        clearAuthState();
        return;
      }

      const appUser = toAppUser(user);
      setCurrentUser(appUser);
      setUserLoggedIn(true);

      if (!loadProfile) return;
      if (profileUserRef.current === user.id) return;

      try {
        const profile = await fetchOrCreateProfile(user);
        profileUserRef.current = user.id;
        setUserDetails(profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setUserDetails({
          email: user.email,
          name: user.user_metadata?.name || '',
        });
      }
    },
    [clearAuthState]
  );

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    (async () => {
      // Wipe dead JWT BEFORE any listener / child fetch (same as clearing localStorage)
      try {
        await ensureValidSession();
      } catch (err) {
        console.warn('Auth bootstrap sanitize failed:', err?.message || err);
        await clearLocalSession();
      }
      if (!mounted) return;

      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'TOKEN_REFRESHED') {
          if (session?.user && !session.user.is_anonymous) {
            const next = toAppUser(session.user);
            setCurrentUser((prev) =>
              prev?.uid === next.uid && prev?.email === next.email ? prev : next
            );
            setUserLoggedIn(true);
          }
          if (mounted) setLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT' || !session?.user) {
          clearAuthState();
          if (mounted) setLoading(false);
          return;
        }

        if (session.user.is_anonymous) {
          await clearLocalSession();
          clearAuthState();
          if (mounted) setLoading(false);
          return;
        }

        const shouldLoadProfile =
          event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION' ||
          event === 'USER_UPDATED' ||
          event === 'PASSWORD_RECOVERY';

        if (shouldLoadProfile) {
          await applySessionUser(session.user, {
            loadProfile: profileUserRef.current !== session.user.id,
          });
        }
        if (mounted) setLoading(false);
      });

      subscription = sub;
      if (mounted) setStorageReady(true);
    })();

    const failSafe = window.setTimeout(() => {
      if (mounted) {
        setStorageReady(true);
        setLoading(false);
      }
    }, 8000);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      window.clearTimeout(failSafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearAuthState]);

  const logout = async () => {
    clearAuthState();
    setLoading(false);
    try {
      await doSignOut();
    } catch (err) {
      console.error('Logout error:', err);
      await clearLocalSession();
    }
  };

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || user.is_anonymous) return null;
    const profile = await fetchOrCreateProfile(user);
    profileUserRef.current = user.id;
    setUserDetails(profile);
    return profile;
  }, []);

  const value = {
    currentUser,
    userDetails,
    userLoggedIn,
    loading,
    logout,
    refreshSession: ensureValidSession,
    refreshProfile,
  };

  // Do not mount products/CMS providers until auth storage is sanitized
  if (!storageReady) {
    return <PlantLoader variant="overlay" lockScroll={false} />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
