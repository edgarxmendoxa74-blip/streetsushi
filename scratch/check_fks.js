import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFKs() {
  // We can't run raw SQL easily via the client unless we have an RPC.
  // But we can try to insert a record into menu_item_ingredients with a non-existent menu_item_id.
  // If it fails with a FK violation, then the FK exists.
  
  const { error } = await supabase.from('menu_item_ingredients').insert({ menu_item_id: 999999, ingredient_id: 1 });
  console.log('FK Check Error:', error?.message);
}

checkFKs();
