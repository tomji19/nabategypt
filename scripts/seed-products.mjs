/**
 * Seed products + images into Supabase.
 * Prerequisites:
 *   1. Run supabase_schema.sql in the Supabase SQL Editor
 *   2. .env has VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 *
 * Usage: npm run seed:products
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const text = readFileSync(join(root, '.env'), 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);
const catalog = JSON.parse(
  readFileSync(join(__dirname, 'product-catalog.json'), 'utf8')
);
const imagesRoot = join(root, 'src', 'assets', 'plantimages');
const BUCKET = 'products';

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.name === BUCKET);
  if (exists) {
    console.log(`Bucket "${BUCKET}" already exists`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });
  if (error) {
    console.warn(
      `Could not create bucket via API (${error.message}). Create a public bucket named "${BUCKET}" in Storage, then re-run.`
    );
  } else {
    console.log(`Created public bucket "${BUCKET}"`);
  }
}

async function uploadImage(product) {
  const localPath = join(imagesRoot, product.image_file);
  if (!existsSync(localPath)) {
    console.warn(`  missing image: ${product.image_file}`);
    return null;
  }
  const buffer = readFileSync(localPath);
  const ext = product.image_file.split('.').pop() || 'jpg';
  const objectPath = `${product.slug}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true,
    });
  if (error) {
    console.warn(`  upload failed for ${product.slug}: ${error.message}`);
    return null;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return data?.publicUrl || null;
}

async function main() {
  console.log('Seeding Nabat products →', url);

  const { error: probe } = await supabase.from('products').select('id').limit(1);
  if (probe) {
    console.error(
      `\nproducts table missing (${probe.message}).\nRun supabase_schema.sql in the Supabase SQL Editor first, then re-run this script.\n`
    );
    process.exit(1);
  }

  await ensureBucket();

  let ok = 0;
  for (const product of catalog) {
    process.stdout.write(`• ${product.slug} … `);
    const imageUrl = await uploadImage(product);
    const row = {
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: '',
      image_url: imageUrl,
      is_active: true,
      is_featured: product.is_featured,
      is_recent: product.is_recent,
      sort_order: product.sort_order,
      care: product.care,
      light: product.light,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'slug' });
    if (error) {
      console.log(`FAIL ${error.message}`);
    } else {
      console.log(imageUrl ? 'ok + image' : 'ok (no image)');
      ok += 1;
    }
  }

  console.log(`\nDone. Upserted ${ok}/${catalog.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
