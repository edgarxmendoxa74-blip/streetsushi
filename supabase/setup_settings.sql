-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    logo_url TEXT DEFAULT '/logo.png',
    hero_title TEXT DEFAULT 'Artistry in Every Bite',
    hero_subtitle TEXT DEFAULT 'Premium Japanese Cuisine',
    fb_url TEXT DEFAULT '',
    ig_url TEXT DEFAULT '',
    tiktok_url TEXT DEFAULT '',
    contact_number TEXT DEFAULT '',
    location TEXT DEFAULT '',
    CONSTRAINT one_row CHECK (id = 1)
);

-- 2. Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- 3. Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- 4. Public access (Read)
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Slides" ON hero_slides FOR SELECT USING (true);

-- 5. Admin access (All)
CREATE POLICY "Admin All Settings" ON site_settings FOR ALL USING (true);
CREATE POLICY "Admin All Slides" ON hero_slides FOR ALL USING (true);

-- 6. Insert default settings if not exists
INSERT INTO site_settings (id, logo_url, hero_title, hero_subtitle)
VALUES (1, '/logo.png', 'Artistry in Every Bite', 'Premium Japanese Cuisine')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert 4 default slides (using placeholders for now)
INSERT INTO hero_slides (image_url, order_index)
VALUES 
('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80', 0),
('https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80', 1),
('https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&q=80', 2),
('https://images.unsplash.com/photo-1563612116625-3012372fccaf?auto=format&fit=crop&q=80', 3);
