import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = readFileSync(resolve(root, '.env'), 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i === -1) continue;
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

let host;
try {
  host = new URL(url).host;
} catch {
  console.error('Invalid VITE_SUPABASE_URL');
  process.exit(1);
}

console.log('host:', host);
console.log('keyFormat:', key.startsWith('sb_publishable_') ? 'publishable' : key.startsWith('eyJ') ? 'legacy-jwt' : 'other');

const supabase = createClient(url.replace(/\/$/, ''), key);
const { data, error } = await supabase
  .from('products')
  .select('id')
  .eq('is_active', true)
  .limit(3);

if (error) {
  console.error('queryFailed:', error.message);
  process.exit(1);
}

console.log('ok: products visible =', data?.length ?? 0);
