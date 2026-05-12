-- 1. Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 3. Public policy to insert contact messages
CREATE POLICY "Allow public to insert contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- 4. Admin policy to read contact messages
CREATE POLICY "Admin read contact messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');

-- 5. FIX EXISTING POLICIES (Make them more secure)
-- Most currently use "USING (true)" for ALL operations. 
-- We should restrict write/update/delete to authenticated users.

-- Categories
DROP POLICY IF EXISTS "Admin All Categories" ON categories;
CREATE POLICY "Admin Manage Categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Menu Items
DROP POLICY IF EXISTS "Admin All Menu Items" ON menu_items;
CREATE POLICY "Admin Manage Menu Items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');

-- Ingredients
DROP POLICY IF EXISTS "Admin All Ingredients" ON ingredients;
CREATE POLICY "Admin Manage Ingredients" ON ingredients FOR ALL USING (auth.role() = 'authenticated');

-- Menu Item Ingredients
DROP POLICY IF EXISTS "Admin All Menu Item Ingredients" ON menu_item_ingredients;
CREATE POLICY "Admin Manage Menu Item Ingredients" ON menu_item_ingredients FOR ALL USING (auth.role() = 'authenticated');

-- Site Settings
DROP POLICY IF EXISTS "Admin All Settings" ON site_settings;
CREATE POLICY "Admin Manage Settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Hero Slides
DROP POLICY IF EXISTS "Admin All Slides" ON hero_slides;
CREATE POLICY "Admin Manage Slides" ON hero_slides FOR ALL USING (auth.role() = 'authenticated');

-- Orders (Public can read their own if we had auth, but for now public read is fine for tracking if needed, 
-- but usually admin only for reading all orders)
DROP POLICY IF EXISTS "Admin All Orders" ON orders;
CREATE POLICY "Admin Manage Orders" ON orders FOR ALL USING (auth.role() = 'authenticated');

-- Order Items
DROP POLICY IF EXISTS "Admin All Order Items" ON order_items;
CREATE POLICY "Admin Manage Order Items" ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- 6. SECURE STORAGE (Only allow uploads/deletes for authenticated users)
DROP POLICY IF EXISTS "Allow Upload for Anon" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update for Anon" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete for Anon" ON storage.objects;

CREATE POLICY "Allow Upload for Authenticated" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'streetsushi' AND auth.role() = 'authenticated');
CREATE POLICY "Allow Update for Authenticated" ON storage.objects FOR UPDATE USING (bucket_id = 'streetsushi' AND auth.role() = 'authenticated');
CREATE POLICY "Allow Delete for Authenticated" ON storage.objects FOR DELETE USING (bucket_id = 'streetsushi' AND auth.role() = 'authenticated');
