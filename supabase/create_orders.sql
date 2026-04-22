-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_phone text,
  total_price decimal(10,2) not null,
  status text default 'pending', -- pending, preparing, ready, completed, cancelled
  order_type text default 'walk-in',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  menu_item_id integer references menu_items(id),
  quantity integer not null,
  price_at_time decimal(10,2) not null,
  item_name text -- Denormalized name in case item is deleted later
);

-- Enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- Allow public to insert orders (for checkout)
create policy "Allow public to insert orders" on orders for insert with check (true);
create policy "Allow public to insert order items" on order_items for insert with check (true);

-- Allow authenticated users (admin) to manage orders
create policy "Allow authenticated users to manage orders" on orders using (auth.role() = 'authenticated');
create policy "Allow authenticated users to manage order items" on order_items using (auth.role() = 'authenticated');
