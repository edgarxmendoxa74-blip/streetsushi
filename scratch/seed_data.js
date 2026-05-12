
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const ingredientsList = [
  'Salmon', 'Sushi Rice', 'Wasabi', 'Tuna', 'Daikon', 'Shiso Leaf',
  'Shrimp Tempura', 'Cucumber', 'Avocado', 'Unagi Sauce', 'Tobiko',
  'Spicy Mayo', 'Sesame', 'Yellowtail', 'Citrus Zest', 'Assorted Fish', 'Ginger'
];

const itemIngredients = {
  'Classic Salmon Nigiri': ['Salmon', 'Sushi Rice', 'Wasabi'],
  'Tuna Sashimi Deluxe': ['Tuna', 'Daikon', 'Shiso Leaf'],
  'Dragon Maki Roll': ['Shrimp Tempura', 'Cucumber', 'Avocado', 'Unagi Sauce', 'Tobiko'],
  'Spicy Tuna Roll': ['Tuna', 'Spicy Mayo', 'Cucumber', 'Sesame'],
  'Yellowtail Nigiri': ['Yellowtail', 'Sushi Rice', 'Citrus Zest'],
  'Chef\'s Sashimi Platter': ['Assorted Fish', 'Wasabi', 'Ginger']
};

async function seed() {
  console.log('Seeding ingredients...');
  const { data: ingData, error: ingErr } = await supabase
    .from('ingredients')
    .upsert(ingredientsList.map(name => ({ name })), { onConflict: 'name' })
    .select();

  if (ingErr) {
    console.error('Error seeding ingredients:', ingErr);
    return;
  }
  console.log(`Seeded ${ingData.length} ingredients.`);

  // Fetch all items and ingredients to get IDs
  const { data: items } = await supabase.from('menu_items').select('id, name');
  const { data: ings } = await supabase.from('ingredients').select('id, name');

  const itemMap = Object.fromEntries(items.map(i => [i.name, i.id]));
  const ingMap = Object.fromEntries(ings.map(i => [i.name, i.id]));

  const junctionData = [];
  for (const [itemName, ingredients] of Object.entries(itemIngredients)) {
    const itemId = itemMap[itemName];
    if (!itemId) continue;
    
    for (const ingName of ingredients) {
      const ingId = ingMap[ingName];
      if (ingId) {
        junctionData.push({ menu_item_id: itemId, ingredient_id: ingId });
      }
    }
  }

  console.log('Seeding junctions...');
  const { error: juncErr } = await supabase
    .from('menu_item_ingredients')
    .upsert(junctionData, { onConflict: 'menu_item_id,ingredient_id' });

  if (juncErr) {
    console.error('Error seeding junctions:', juncErr);
  } else {
    console.log(`Seeded ${junctionData.length} junctions.`);
  }
}

seed();
