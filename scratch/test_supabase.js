import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing connection to:', supabaseUrl);
  
  const { data: cat, error: catError } = await supabase.from('categories').select('count', { count: 'exact', head: true });
  if (catError) {
    console.error('Categories Error:', catError);
  } else {
    console.log('Categories exist.');
  }

  const { data: menu, error: menuError } = await supabase
    .from('menu_items')
    .select(`
      id, name, price, description, image_url, is_featured,
      categories ( name ),
      menu_item_ingredients ( ingredients ( name ) )
    `)
    .limit(1);
    
  if (menuError) {
    console.error('Menu Items Query Error:', menuError);
  } else {
    console.log('Menu Items Query success.');
  }
}

test();
