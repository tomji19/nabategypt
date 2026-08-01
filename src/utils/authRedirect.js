/**
 * Safe in-app path after login/register.
 * Accepts location.state.from or ?redirect=
 */
export function getPostAuthRedirect(location, fallback = '/') {
  const fromState = location?.state?.from;
  if (isSafePath(fromState)) return fromState;

  try {
    const params = new URLSearchParams(location?.search || '');
    const fromQuery = params.get('redirect');
    if (isSafePath(fromQuery)) return fromQuery;
  } catch {
    // ignore
  }

  return fallback;
}

function isSafePath(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('://')
  );
}

export function loginPathWithRedirect(path = '/checkout') {
  if (!isSafePath(path)) return '/login';
  return `/login?redirect=${encodeURIComponent(path)}`;
}
