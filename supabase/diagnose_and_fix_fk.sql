-- DIAGNOSTIC AND FIX SCRIPT FOR FK CONSTRAINT ERROR
-- Run these commands ONE AT A TIME in Supabase SQL Editor

-- ============================================
-- STEP 1: Check existing menu items
-- ============================================
SELECT id, name FROM menu_items LIMIT 10;

-- ============================================
-- STEP 2: Check table structure
-- ============================================
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'order_items';

-- ============================================
-- STEP 3: Fix the foreign key constraint
-- ============================================
-- Drop the problematic constraint
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey CASCADE;

-- Add new constraint that allows NULL values
ALTER TABLE order_items
ADD CONSTRAINT order_items_menu_item_id_fkey 
FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL;

-- ============================================
-- STEP 4: Verify the constraint was created
-- ============================================
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'order_items' AND column_name = 'menu_item_id';

-- ============================================
-- STEP 5: Test by checking if you can see valid menu items
-- ============================================
SELECT COUNT(*) as total_menu_items FROM menu_items;

-- If count is 0, you need to seed the database with the COMPLETE_ADMIN_DASHBOARD_SETUP.sql file
