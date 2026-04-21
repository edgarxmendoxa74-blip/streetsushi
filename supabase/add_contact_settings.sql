-- Add contact and social media fields to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS facebook_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS tiktok_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS location_address TEXT DEFAULT '';
