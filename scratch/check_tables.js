import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFKs() {
  const { data, error } = await supabase.rpc('get_fks'); // I don't have this RPC, I should use a direct query if possible, but Supabase JS doesn't allow raw SQL easily unless I use a specific endpoint.
  
  // Let's just try to query menu_item_ingredients directly to see if it exists
  const { data: mii, error: miiError } = await supabase.from('menu_item_ingredients').select('*').limit(1);
  console.log('menu_item_ingredients exists:', !miiError);
  if (miiError) console.error(miiError);
}

checkFKs();
