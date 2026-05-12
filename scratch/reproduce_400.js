import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function reproduce() {
  console.log('Testing query from Menu.jsx...');
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      id, name, price, description, image_url, is_featured,
      categories ( name ),
      menu_item_ingredients ( ingredients ( name ) )
    `);
  
  if (error) {
    console.error('Error Status:', error.status);
    console.error('Error Message:', error.message);
    console.error('Error Details:', error.details);
    console.error('Error Hint:', error.hint);
  } else {
    console.log('Success! Data fetched:', data.length, 'items');
  }
}

reproduce();
