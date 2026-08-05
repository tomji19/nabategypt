/** Prefer CMS / Supabase URL only — no bundled static image fallbacks */
export function cmsImage(url) {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  return trimmed || '';
}
