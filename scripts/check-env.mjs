/**
 * Fail production builds early if Vite env vars are missing.
 * Vite only embeds VITE_* at build time — setting them only in the host UI
 * after a deploy (without rebuild) does nothing.
 *
 * Loads root `.env` for local builds; Netlify injects process.env directly.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(resolve(process.cwd(), '.env'));
loadDotEnv(resolve(process.cwd(), '.env.local'));
loadDotEnv(resolve(process.cwd(), '.env.production'));

const url = String(process.env.VITE_SUPABASE_URL || '').trim();
const key = String(process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!url || !key) {
  console.error(`
Missing required environment variables for production build:

  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY

Local: put them in .env (see .env.example), then rebuild.
Netlify: Site configuration → Environment variables → add both →
         Deploys → Trigger deploy → Clear cache and deploy site.
`);
  process.exit(1);
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
  console.warn(
    'Warning: VITE_SUPABASE_URL looks unusual:',
    url,
    '(expected https://YOUR_PROJECT.supabase.co)'
  );
}

console.log('Supabase env OK — building…');
