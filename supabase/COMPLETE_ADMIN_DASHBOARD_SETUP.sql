-- STREET SUSHI FULL DATABASE SETUP
-- Includes: Categories, Menu Items, Ingredients, Site Settings, Hero Slides, Orders, and RLS Policies

-- 0. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 4. Create menu_item_ingredients junction table
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    UNIQUE(menu_item_id, ingredient_id)
);

-- 5. Create site_settings table (One row only)
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    logo_url TEXT DEFAULT '/logo.png',
    hero_title TEXT DEFAULT 'Artistry in Every Bite',
    hero_subtitle TEXT DEFAULT 'Premium Japanese Cuisine',
    hero_description TEXT DEFAULT 'Experience the soul of Tokyo street sushi with the freshest cuts and master-crafted recipes.',
    fb_url TEXT DEFAULT '',
    ig_url TEXT DEFAULT '',
    tiktok_url TEXT DEFAULT '',
    contact_number TEXT DEFAULT '',
    location TEXT DEFAULT '',
    CONSTRAINT one_row CHECK (id = 1)
);

-- 6. Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- 7. Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, completed, cancelled
    order_type TEXT DEFAULT 'walk-in',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    item_name TEXT -- Denormalized name
);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 10. Policies - Public Read Access
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Menu Items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public Read Ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public Read Menu Item Ingredients" ON menu_item_ingredients FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Slides" ON hero_slides FOR SELECT USING (true);

-- 11. Policies - Order Placement (Public Insert)
CREATE POLICY "Allow public to insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- 12. Policies - Admin Management (Full access)
CREATE POLICY "Admin All Categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admin All Menu Items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Admin All Ingredients" ON ingredients FOR ALL USING (true);
CREATE POLICY "Admin All Menu Item Ingredients" ON menu_item_ingredients FOR ALL USING (true);
CREATE POLICY "Admin All Settings" ON site_settings FOR ALL USING (true);
CREATE POLICY "Admin All Slides" ON hero_slides FOR ALL USING (true);
CREATE POLICY "Admin All Orders" ON orders FOR ALL USING (true);
CREATE POLICY "Admin All Order Items" ON order_items FOR ALL USING (true);

-- 13. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('streetsushi', 'streetsushi', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload for Anon" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update for Anon" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete for Anon" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'streetsushi');
CREATE POLICY "Allow Upload for Anon" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'streetsushi');
CREATE POLICY "Allow Update for Anon" ON storage.objects FOR UPDATE USING (bucket_id = 'streetsushi') WITH CHECK (bucket_id = 'streetsushi');
CREATE POLICY "Allow Delete for Anon" ON storage.objects FOR DELETE USING (bucket_id = 'streetsushi');

-- =============================================
-- 14. SEED DATA
-- =============================================

-- Categories
INSERT INTO categories (name) VALUES 
('Nigiri'), ('Sashimi'), ('Rolls'), ('Drinks')
ON CONFLICT (name) DO NOTHING;

-- Ingredients
INSERT INTO ingredients (name) VALUES 
('Salmon'), ('Sushi Rice'), ('Wasabi'),
('Tuna'), ('Daikon'), ('Shiso Leaf'),
('Shrimp Tempura'), ('Cucumber'), ('Avocado'), ('Unagi Sauce'), ('Tobiko'),
('Spicy Mayo'), ('Sesame'),
('Yellowtail'), ('Citrus Zest'),
('Assorted Fish'), ('Ginger')
ON CONFLICT (name) DO NOTHING;

-- Menu Items
INSERT INTO menu_items (name, category_id, price, description, image_url, is_featured)
VALUES 
('Classic Salmon Nigiri', (SELECT id FROM categories WHERE name = 'Nigiri'), 8.50, 'Two pieces of fresh Atlantic salmon over hand-pressed sushi rice.', '/assets/nigiri.png', true),
('Tuna Sashimi Deluxe', (SELECT id FROM categories WHERE name = 'Sashimi'), 14.00, 'Five thick slices of premium yellowfin tuna served with daikon and shiso.', '/assets/sashimi.png', false),
('Dragon Maki Roll', (SELECT id FROM categories WHERE name = 'Rolls'), 16.50, 'Shrimp tempura and cucumber topped with avocado, unagi sauce, and tobiko.', '/assets/rolls.png', true),
('Spicy Tuna Roll', (SELECT id FROM categories WHERE name = 'Rolls'), 12.00, 'Diced tuna tossed in spicy mayo with cucumber and sesame seeds.', '/assets/rolls.png', false),
('Yellowtail Nigiri', (SELECT id FROM categories WHERE name = 'Nigiri'), 9.50, 'Fresh Hamachi with a touch of citrus zest.', '/assets/nigiri.png', false),
('Chef''s Sashimi Platter', (SELECT id FROM categories WHERE name = 'Sashimi'), 28.00, 'A curated selection of the day''s freshest catches (12 pieces).', '/assets/sashimi.png', true);

-- Menu Item Ingredients (Junction Table)
-- Classic Salmon Nigiri: Salmon, Sushi Rice, Wasabi
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id) VALUES
((SELECT id FROM menu_items WHERE name = 'Classic Salmon Nigiri'), (SELECT id FROM ingredients WHERE name = 'Salmon')),
((SELECT id FROM menu_items WHERE name = 'Classic Salmon Nigiri'), (SELECT id FROM ingredients WHERE name = 'Sushi Rice')),
((SELECT id FROM menu_items WHERE name = 'Classic Salmon Nigiri'), (SELECT id FROM ingredients WHERE name = 'Wasabi'));

-- Tuna Sashimi Deluxe: Tuna, Daikon, Shiso Leaf
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id) VALUES
((SELECT id FROM menu_items WHERE name = 'Tuna Sashimi Deluxe'), (SELECT id FROM ingredients WHERE name = 'Tuna')),
((SELECT id FROM menu_items WHERE name = 'Tuna Sashimi Deluxe'), (SELECT id FROM ingredients WHERE name = 'Daikon')),
((SELECT id FROM menu_items WHERE name = 'Tuna Sashimi Deluxe'), (SELECT id FROM ingredients WHERE name = 'Shiso Leaf'));

-- Dragon Maki Roll: Shrimp Tempura, Cucumber, Avocado, Unagi Sauce, Tobiko
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id) VALUES
((SELECT id FROM menu_items WHERE name = 'Dragon Maki Roll'), (SELECT id FROM ingredients WHERE name = 'Shrimp Tempura')),
((SELECT id FROM menu_items WHERE name = 'Dragon Maki Roll'), (SELECT id FROM ingredients WHERE name = 'Cucumber')),
((SELECT id FROM menu_items WHERE name = 'Dragon Maki Roll'), (SELECT id FROM ingredients WHERE name = 'Avocado')),
((SELECT id FROM menu_items WHERE name = 'Dragon Maki Roll'), (SELECT id FROM ingredients WHERE name = 'Unagi Sauce')),
((SELECT id FROM menu_items WHERE name = 'Dragon Maki Roll'), (SELECT id FROM ingredients WHERE name = 'Tobiko'));

-- Spicy Tuna Roll: Tuna, Spicy Mayo, Cucumber, Sesame
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id) VALUES
((SELECT id FROM menu_items WHERE name = 'Spicy Tuna Roll'), (SELECT id FROM ingredients WHERE name = 'Tuna')),
((SELECT id FROM menu_items WHERE name = 'Spicy Tuna Roll'), (SELECT id FROM ingredients WHERE name = 'Spicy Mayo')),
((SELECT id FROM menu_items WHERE name = 'Spicy Tuna Roll'), (SELECT id FROM ingredients WHERE name = 'Cucumber')),
((SELECT id FROM menu_items WHERE name = 'Spicy Tuna Roll'), (SELECT id FROM ingredients WHERE name = 'Sesame'));

-- Yellowtail Nigiri: Yellowtail, Sushi Rice, Citrus Zest
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id) VALUES
((SELECT id FROM menu_items WHERE name = 'Yellowtail Nigiri'), (SELECT id FROM ingredients WHERE name = 'Yellowtail')),
((SELECT id FROM menu_items WHERE name = 'Yellowtail Nigiri'), (SELECT id FROM ingredients WHERE name = 'Sushi Rice')),
((SELECT id FROM menu_items WHERE name = 'Yellowtail Nigiri'), (SELECT id FROM ingredients WHERE name = 'Citrus Zest'));

-- Chef's Sashimi Platter: Assorted Fish, Wasabi, Ginger
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id) VALUES
((SELECT id FROM menu_items WHERE name = 'Chef''s Sashimi Platter'), (SELECT id FROM ingredients WHERE name = 'Assorted Fish')),
((SELECT id FROM menu_items WHERE name = 'Chef''s Sashimi Platter'), (SELECT id FROM ingredients WHERE name = 'Wasabi')),
((SELECT id FROM menu_items WHERE name = 'Chef''s Sashimi Platter'), (SELECT id FROM ingredients WHERE name = 'Ginger'));

-- Site Settings
INSERT INTO site_settings (id, logo_url, hero_title, hero_subtitle, hero_description)
VALUES (1, '/logo.png', 'Artistry in Every Bite', 'Premium Japanese Cuisine', 'Experience the soul of Tokyo street sushi with the freshest cuts and master-crafted recipes.')
ON CONFLICT (id) DO NOTHING;

-- Hero Slides
INSERT INTO hero_slides (image_url, order_index)
VALUES 
('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80', 0),
('https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80', 1),
('https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&q=80', 2),
('https://images.unsplash.com/photo-1563612116625-3012372fccaf?auto=format&fit=crop&q=80', 3);
