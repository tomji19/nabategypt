import React, { useCallback, useContext, useEffect, useState } from 'react';
import { supabase, ensureValidSession } from '../../supabase/supabase';
import { doSignOut } from '../../supabase/auth';

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

  const clearAuthState = useCallback(() => {
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

      try {
        const profile = await fetchOrCreateProfile(user);
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

    const boot = async () => {
      try {
        const session = await ensureValidSession();
        if (!mounted) return;

        if (session?.user) {
          await applySessionUser(session.user, { loadProfile: true });
        } else {
          clearAuthState();
        }
      } catch (err) {
        console.error('Auth boot error:', err);
        if (mounted) clearAuthState();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Access token was refreshed — keep user logged in; no need to re-hit profiles
      if (event === 'TOKEN_REFRESHED') {
        if (session?.user && !session.user.is_anonymous) {
          const next = toAppUser(session.user);
          setCurrentUser((prev) =>
            prev?.uid === next.uid && prev?.email === next.email ? prev : next
          );
          setUserLoggedIn(true);
        }
        return;
      }

      if (event === 'SIGNED_OUT' || !session?.user) {
        clearAuthState();
        setLoading(false);
        return;
      }

      if (session.user.is_anonymous) {
        await supabase.auth.signOut({ scope: 'local' });
        clearAuthState();
        setLoading(false);
        return;
      }

      // SIGNED_IN, INITIAL_SESSION, USER_UPDATED, PASSWORD_RECOVERY, etc.
      if (
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'USER_UPDATED' ||
        event === 'PASSWORD_RECOVERY'
      ) {
        await applySessionUser(session.user, { loadProfile: true });
        setLoading(false);
      }
    });

    // Soft-update currentUser on tab focus — keep same object if unchanged
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      ensureValidSession().then((session) => {
        if (!mounted) return;
        if (!session?.user || session.user.is_anonymous) {
          clearAuthState();
          return;
        }
        const next = toAppUser(session.user);
        setCurrentUser((prev) =>
          prev?.uid === next.uid && prev?.email === next.email ? prev : next
        );
        setUserLoggedIn(true);
      });
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [applySessionUser, clearAuthState]);

  const logout = async () => {
    clearAuthState();
    setLoading(false);
    try {
      await doSignOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user || user.is_anonymous) return null;
    const profile = await fetchOrCreateProfile(user);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
