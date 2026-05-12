import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMenuItems() {
  const { data, error } = await supabase.from('menu_items').select('id').limit(1);
  console.log('menu_items exists:', !error);
  if (error) console.error(error);
}

checkMenuItems();
