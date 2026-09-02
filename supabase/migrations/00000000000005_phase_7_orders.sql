-- Phase 7: Order Management & Checkout Transaction

-- 1. NEW ENUMS
CREATE TYPE order_source AS ENUM ('website', 'whatsapp', 'phone', 'manual', 'other');

-- 2. ALTER EXISTING ORDERS TABLE
ALTER TABLE orders 
  ADD COLUMN order_number VARCHAR(50) UNIQUE,
  ADD COLUMN order_source order_source DEFAULT 'website' NOT NULL,
  ADD COLUMN customer_email VARCHAR(255) NOT NULL,
  ADD COLUMN customer_phone VARCHAR(50) NOT NULL,
  ADD COLUMN customer_first_name VARCHAR(255) NOT NULL,
  ADD COLUMN customer_last_name VARCHAR(255) NOT NULL,
  ADD COLUMN shipping_address_line1 TEXT NOT NULL,
  ADD COLUMN shipping_address_line2 TEXT,
  ADD COLUMN shipping_city VARCHAR(100) NOT NULL,
  ADD COLUMN shipping_state VARCHAR(100),
  ADD COLUMN shipping_postal_code VARCHAR(20) NOT NULL,
  ADD COLUMN admin_notes TEXT;

-- 3. CREATE ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE ORDER HISTORY TABLE
CREATE TABLE order_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status order_status NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Null implies system/customer
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RLS POLICIES
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own order items
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Users can view their own order history
CREATE POLICY "Users can view own order history" ON order_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_history.order_id AND orders.user_id = auth.uid())
);

-- 6. CHECKOUT RPC
-- This function processes a cart atomically, locks rows, creates the order, deducts stock, and clears the cart.
CREATE OR REPLACE FUNCTION checkout_cart(
    p_cart_id UUID,
    p_user_id UUID, -- Nullable for guest
    p_order_source order_source,
    p_customer_email VARCHAR,
    p_customer_phone VARCHAR,
    p_customer_first_name VARCHAR,
    p_customer_last_name VARCHAR,
    p_shipping_address_line1 TEXT,
    p_shipping_address_line2 TEXT,
    p_shipping_city VARCHAR,
    p_shipping_state VARCHAR,
    p_shipping_postal_code VARCHAR,
    p_payment_method VARCHAR,
    p_shipping_cost DECIMAL
) RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_product_price RECORD;
    v_unit_price DECIMAL;
    v_subtotal DECIMAL := 0;
    v_grand_total DECIMAL := 0;
    v_order_id UUID;
    v_order_number VARCHAR;
    v_stock_available INTEGER;
BEGIN
    -- Generate order number (ORD-YYYYMMDD-RandomHex)
    v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

    -- Loop through cart items and lock product pricing & inventory rows for update
    FOR v_item IN (SELECT * FROM cart_items WHERE cart_id = p_cart_id) LOOP
        
        -- Lock inventory to prevent race conditions
        SELECT quantity INTO v_stock_available 
        FROM inventory 
        WHERE product_id = v_item.product_id 
          AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL))
        FOR UPDATE;

        IF NOT FOUND OR v_stock_available < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
        END IF;

        -- Fetch true live price
        SELECT retail_price, sale_price, is_flash_sale INTO v_product_price 
        FROM product_pricing 
        WHERE product_id = v_item.product_id;

        IF v_product_price.sale_price IS NOT NULL THEN
            v_unit_price := v_product_price.sale_price;
        ELSE
            v_unit_price := v_product_price.retail_price;
        END IF;

        v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
    END LOOP;

    v_grand_total := v_subtotal + p_shipping_cost;

    -- Create Order Record
    INSERT INTO orders (
        user_id, order_number, order_source, subtotal, shipping_cost, grand_total, 
        status, payment_method, payment_status, 
        customer_email, customer_phone, customer_first_name, customer_last_name,
        shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code
    ) VALUES (
        p_user_id, v_order_number, p_order_source, v_subtotal, p_shipping_cost, v_grand_total,
        'pending', p_payment_method, 'pending',
        p_customer_email, p_customer_phone, p_customer_first_name, p_customer_last_name,
        p_shipping_address_line1, p_shipping_address_line2, p_shipping_city, p_shipping_state, p_shipping_postal_code
    ) RETURNING id INTO v_order_id;

    -- Insert Order Items & Deduct Stock
    FOR v_item IN (SELECT * FROM cart_items WHERE cart_id = p_cart_id) LOOP
        
        -- Price again
        SELECT retail_price, sale_price INTO v_product_price FROM product_pricing WHERE product_id = v_item.product_id;
        v_unit_price := COALESCE(v_product_price.sale_price, v_product_price.retail_price);

        -- Insert Order Item
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, total_price)
        VALUES (v_order_id, v_item.product_id, v_item.variant_id, v_item.quantity, v_unit_price, v_unit_price * v_item.quantity);

        -- Deduct stock using the RPC created in Phase 4
        PERFORM adjust_stock(v_item.product_id, v_item.variant_id, -(v_item.quantity), 'Order Placement', v_order_id::text);

    END LOOP;

    -- Create initial order history entry
    INSERT INTO order_history (order_id, status, notes) VALUES (v_order_id, 'pending', 'Order placed via ' || p_order_source);

    -- Clear cart
    UPDATE carts SET status = 'converted' WHERE id = p_cart_id;
    DELETE FROM cart_items WHERE cart_id = p_cart_id;

    -- Return JSON success
    RETURN json_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
