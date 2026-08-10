-- Fix order_items foreign key constraint
-- Make menu_item_id nullable to handle deleted menu items in historical orders

-- Drop existing constraint if it exists
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey;

-- Add new constraint with ON DELETE SET NULL
ALTER TABLE order_items
ADD CONSTRAINT order_items_menu_item_id_fkey 
FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL;

-- Ensure order_items table allows NULL menu_item_id
-- This is already the default, but making it explicit
-- No need to modify columns since they already allow NULL
