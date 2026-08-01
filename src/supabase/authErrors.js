/**
 * Map Supabase / auth errors to clear user-facing messages.
 */
export function getAuthErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  const msg = String(error.message || error.error_description || '').toLowerCase();
  const code = String(error.code || error.error || error.status || '').toLowerCase();

  if (
    code === 'email_exists' ||
    code === 'user_already_exists' ||
    msg.includes('already registered') ||
    msg.includes('already exists') ||
    msg.includes('email address is already') ||
    msg.includes('user already')
  ) {
    return 'This email is already registered. Please sign in instead.';
  }

  if (
    code === 'invalid_credentials' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials')
  ) {
    return 'Invalid email or password.';
  }

  if (
    code === 'email_not_confirmed' ||
    msg.includes('email not confirmed') ||
    msg.includes('not confirmed')
  ) {
    return 'Please confirm your email before signing in. Check your inbox (and spam).';
  }

  if (msg.includes('user not found') || code === 'user_not_found') {
    return 'No account found with this email.';
  }

  if (
    msg.includes('password') &&
    (msg.includes('weak') || msg.includes('least') || msg.includes('characters'))
  ) {
    return 'Password is too weak. Use at least 8 characters with upper, lower, and a number.';
  }

  if (msg.includes('rate limit') || msg.includes('too many') || code === 'over_request_rate_limit') {
    return 'Too many attempts. Please wait a minute and try again.';
  }

  if (msg.includes('network') || msg.includes('fetch') || code === 'network_error') {
    return 'Network error. Check your connection and try again.';
  }

  if (msg.includes('session') && (msg.includes('expired') || msg.includes('invalid'))) {
    return 'Your session expired. Please sign in again.';
  }

  if (msg.includes('same password') || msg.includes('different from the old')) {
    return 'New password must be different from your current password.';
  }

  if (error.message && error.message.length < 160) {
    return error.message;
  }

  return fallback;
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
