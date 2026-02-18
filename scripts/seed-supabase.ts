/**
 * Seed Supabase with enriched tool data
 *
 * Usage: npx tsx scripts/seed-supabase.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY env vars
 * (uses service key for admin write access)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  // Load categories
  const categoriesPath = path.join(__dirname, '..', 'data', 'seed-categories.json');
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

  console.log(`Seeding ${categories.length} categories...`);
  const { error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' });
  if (catError) {
    console.error('Error seeding categories:', catError);
    process.exit(1);
  }
  console.log('Categories seeded.');

  // Load enriched tools (or fall back to seed tools)
  const enrichedPath = path.join(__dirname, '..', 'data', 'enriched-tools.json');
  const seedPath = path.join(__dirname, '..', 'data', 'seed-tools.json');
  const toolsPath = fs.existsSync(enrichedPath) ? enrichedPath : seedPath;
  const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

  console.log(`Seeding ${tools.length} tools from ${path.basename(toolsPath)}...`);

  // Insert in batches of 20
  const batchSize = 20;
  for (let i = 0; i < tools.length; i += batchSize) {
    const batch = tools.slice(i, i + batchSize);
    const { error: toolError } = await supabase
      .from('tools')
      .upsert(batch, { onConflict: 'slug' });
    if (toolError) {
      console.error(`Error seeding tools batch ${i}:`, toolError);
    } else {
      console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} tools`);
    }
  }

  // Refresh category counts (direct update to bypass RLS/PostgREST WHERE clause restriction)
  const { data: catRows } = await supabase.from('categories').select('slug');
  for (const cat of catRows || []) {
    const { count } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat.slug);
    await supabase
      .from('categories')
      .update({ tool_count: count ?? 0 })
      .eq('slug', cat.slug);
  }
  console.log('Category counts refreshed.');

  // Load and seed collections
  const collectionsPath = path.join(__dirname, '..', 'data', 'seed-collections.json');
  if (fs.existsSync(collectionsPath)) {
    const rawCollections = JSON.parse(fs.readFileSync(collectionsPath, 'utf-8'));

    // Resolve tool slugs to IDs
    for (const col of rawCollections) {
      if (col.tool_slugs) {
        const { data: toolRows } = await supabase
          .from('tools')
          .select('id, slug')
          .in('slug', col.tool_slugs);
        col.tool_ids = (toolRows || []).map((t: { id: string }) => t.id);
        delete col.tool_slugs;
      }
    }

    const { error: colError } = await supabase
      .from('collections')
      .upsert(rawCollections, { onConflict: 'slug' });
    if (colError) {
      console.error('Error seeding collections:', colError);
    } else {
      console.log(`${rawCollections.length} collections seeded.`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
