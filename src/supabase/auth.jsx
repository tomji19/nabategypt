import { supabase } from './supabase';
import { normalizeEmail } from './authErrors';

const AUTH_STORAGE_KEY = 'nabat-auth';

function clearAuthStorage() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
}

function throwAuthError(message, code) {
  const err = new Error(message);
  err.code = code;
  throw err;
}

export const doCreateUserWithEmailAndPassword = async (
  email,
  password,
  metadata = {}
) => {
  const normalized = normalizeEmail(email);
  if (!normalized) throwAuthError('Email is required.', 'validation');
  if (!password) throwAuthError('Password is required.', 'validation');

  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: {
      data: {
        fullname: metadata.fullname || metadata.name || '',
        name: metadata.name || metadata.fullname || '',
      },
      emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
    },
  });
  if (error) throw error;

  // Fake success when email already exists (Supabase anti-enumeration)
  const identities = data?.user?.identities;
  if (data?.user && Array.isArray(identities) && identities.length === 0) {
    throwAuthError(
      'This email is already registered. Please sign in instead.',
      'email_exists'
    );
  }

  if (!data?.user) {
    throwAuthError('Could not create account. Please try again.', 'signup_failed');
  }

  return data;
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  const normalized = normalizeEmail(email);
  if (!normalized) throwAuthError('Email is required.', 'validation');
  if (!password) throwAuthError('Password is required.', 'validation');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });
  if (error) throw error;

  if (!data?.user) {
    throwAuthError('Sign in failed. Please try again.', 'signin_failed');
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut({ scope: 'local' });
    throwAuthError(
      'Please confirm your email before signing in. Check your inbox (and spam).',
      'email_not_confirmed'
    );
  }

  return data;
};

export const doSignOut = async () => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    console.warn('Sign out (global) warning:', err);
  }
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (err) {
    console.warn('Sign out (local) warning:', err);
  }
  clearAuthStorage();
};

export const DoPasswordReset = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) throwAuthError('Email is required.', 'validation');

  const { data, error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
};

export const doPasswordChange = async (newPassword) => {
  if (!newPassword || newPassword.length < 8) {
    throwAuthError(
      'Password must be at least 8 characters.',
      'validation'
    );
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
};

export const doSendEmailVerification = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) throwAuthError('No email to verify.', 'validation');
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: normalized,
  });
  if (error) throw error;
  return data;
};
