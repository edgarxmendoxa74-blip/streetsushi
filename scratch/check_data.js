
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: items } = await supabase.from('menu_items').select('id, name');
  const { data: ingredients } = await supabase.from('ingredients').select('id, name');
  const { data: junctions } = await supabase.from('menu_item_ingredients').select('*');

  console.log('--- Menu Items ---');
  items?.forEach(i => console.log(`[${i.id}] ${i.name}`));
  
  console.log('\n--- Ingredients ---');
  ingredients?.forEach(i => console.log(`[${i.id}] ${i.name}`));

  console.log('\n--- Junctions ---');
  console.log('Count:', junctions?.length || 0);
  junctions?.slice(0, 5).forEach(j => console.log(`ItemID: ${j.menu_item_id}, IngredientID: ${j.ingredient_id}`));
}

checkData();
