import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  const tables = ['site_settings', 'hero_slides', 'categories', 'menu_items', 'ingredients', 'menu_item_ingredients'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    console.log(`${table} exists:`, !error);
    if (error) console.log(`  Error: ${error.message}`);
  }
}

checkAll();
