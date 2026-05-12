-- ============================================
-- FIX: Create missing tables & foreign keys
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create ingredients table (if missing)
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 2. Create menu_item_ingredients junction table (if missing)
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    UNIQUE(menu_item_id, ingredient_id)
);

-- 3. Add foreign keys on menu_item_ingredients
ALTER TABLE menu_item_ingredients
  DROP CONSTRAINT IF EXISTS menu_item_ingredients_menu_item_id_fkey;
ALTER TABLE menu_item_ingredients
  ADD CONSTRAINT menu_item_ingredients_menu_item_id_fkey
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE;

ALTER TABLE menu_item_ingredients
  DROP CONSTRAINT IF EXISTS menu_item_ingredients_ingredient_id_fkey;
ALTER TABLE menu_item_ingredients
  ADD CONSTRAINT menu_item_ingredients_ingredient_id_fkey
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

-- 4. Ensure menu_items -> categories FK exists
ALTER TABLE menu_items
  DROP CONSTRAINT IF EXISTS menu_items_category_id_fkey;
ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 5. Enable RLS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (public read + admin full access)
DROP POLICY IF EXISTS "Public Read Ingredients" ON ingredients;
CREATE POLICY "Public Read Ingredients" ON ingredients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Ingredients" ON ingredients;
CREATE POLICY "Admin All Ingredients" ON ingredients FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Menu Item Ingredients" ON menu_item_ingredients;
CREATE POLICY "Public Read Menu Item Ingredients" ON menu_item_ingredients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin All Menu Item Ingredients" ON menu_item_ingredients;
CREATE POLICY "Admin All Menu Item Ingredients" ON menu_item_ingredients FOR ALL USING (true);

-- 7. Seed ingredients
INSERT INTO ingredients (name) VALUES 
('Salmon'), ('Sushi Rice'), ('Wasabi'),
('Tuna'), ('Daikon'), ('Shiso Leaf'),
('Shrimp Tempura'), ('Cucumber'), ('Avocado'), ('Unagi Sauce'), ('Tobiko'),
('Spicy Mayo'), ('Sesame'),
('Yellowtail'), ('Citrus Zest'),
('Assorted Fish'), ('Ginger')
ON CONFLICT (name) DO NOTHING;

-- 8. Seed menu_item_ingredients (junction table)
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
SELECT mi.id, i.id FROM menu_items mi, ingredients i
WHERE mi.name = 'Classic Salmon Nigiri' AND i.name IN ('Salmon', 'Sushi Rice', 'Wasabi')
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;

INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
SELECT mi.id, i.id FROM menu_items mi, ingredients i
WHERE mi.name = 'Tuna Sashimi Deluxe' AND i.name IN ('Tuna', 'Daikon', 'Shiso Leaf')
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;

INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
SELECT mi.id, i.id FROM menu_items mi, ingredients i
WHERE mi.name = 'Dragon Maki Roll' AND i.name IN ('Shrimp Tempura', 'Cucumber', 'Avocado', 'Unagi Sauce', 'Tobiko')
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;

INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
SELECT mi.id, i.id FROM menu_items mi, ingredients i
WHERE mi.name = 'Spicy Tuna Roll' AND i.name IN ('Tuna', 'Spicy Mayo', 'Cucumber', 'Sesame')
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;

INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
SELECT mi.id, i.id FROM menu_items mi, ingredients i
WHERE mi.name = 'Yellowtail Nigiri' AND i.name IN ('Yellowtail', 'Sushi Rice', 'Citrus Zest')
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;

INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id)
SELECT mi.id, i.id FROM menu_items mi, ingredients i
WHERE mi.name = 'Chef''s Sashimi Platter' AND i.name IN ('Assorted Fish', 'Wasabi', 'Ginger')
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;

-- 9. Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
