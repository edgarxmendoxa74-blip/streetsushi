
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      id, name, price, description, image_url, is_featured,
      categories ( name ),
      menu_item_ingredients ( ingredients ( name ) )
    `);

  if (error) {
    console.error('Error fetching menu items:', error);
    console.error('Error Message:', error.message);
    console.error('Error Details:', error.details);
    console.error('Error Hint:', error.hint);
  } else {
    console.log('Successfully fetched menu items:', data.length);
    data.slice(0, 3).forEach(item => {
      console.log(`Item: ${item.name}`);
      console.log(` - Category: ${item.categories?.name}`);
      console.log(` - Ingredients Count: ${item.menu_item_ingredients?.length || 0}`);
      console.log(` - Ingredients:`, item.menu_item_ingredients?.map(mi => mi.ingredients?.name));
    });
  }
}

testQuery();
