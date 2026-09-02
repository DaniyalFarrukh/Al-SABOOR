-- Phase 10: Retailer Role and Pricing

-- 1. Insert Retailer Role
INSERT INTO roles (name, description) 
VALUES ('Retailer', 'B2B customers who purchase in bulk quantities')
ON CONFLICT (name) DO NOTHING;

-- 2. Alter Pricing Table
ALTER TABLE product_pricing
ADD COLUMN IF NOT EXISTS retailer_price DECIMAL(10, 2);

-- 3. Update Checkout RPC
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
    v_is_retailer BOOLEAN := false;
BEGIN
    -- Check if user is a Retailer
    IF p_user_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM profiles p 
            JOIN roles r ON p.role_id = r.id 
            WHERE p.id = p_user_id AND r.name = 'Retailer'
        ) INTO v_is_retailer;
    END IF;

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
        SELECT retail_price, sale_price, retailer_price INTO v_product_price 
        FROM product_pricing 
        WHERE product_id = v_item.product_id;

        -- Determine Price based on Retailer status
        IF v_is_retailer AND v_product_price.retailer_price IS NOT NULL THEN
            v_unit_price := v_product_price.retailer_price;
        ELSEIF v_product_price.sale_price IS NOT NULL THEN
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
        SELECT retail_price, sale_price, retailer_price INTO v_product_price FROM product_pricing WHERE product_id = v_item.product_id;
        
        IF v_is_retailer AND v_product_price.retailer_price IS NOT NULL THEN
            v_unit_price := v_product_price.retailer_price;
        ELSEIF v_product_price.sale_price IS NOT NULL THEN
            v_unit_price := v_product_price.sale_price;
        ELSE
            v_unit_price := v_product_price.retail_price;
        END IF;

        -- Insert Order Item
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, total_price)
        VALUES (v_order_id, v_item.product_id, v_item.variant_id, v_item.quantity, v_unit_price, v_unit_price * v_item.quantity);

        -- Deduct Stock (Already locked)
        UPDATE inventory 
        SET quantity = quantity - v_item.quantity,
            updated_at = timezone('utc'::text, now())
        WHERE product_id = v_item.product_id 
          AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL));
          
    END LOOP;

    -- Create initial order history entry
    INSERT INTO order_history (order_id, status, notes)
    VALUES (v_order_id, 'pending', 'Order placed successfully');

    -- Clear cart
    DELETE FROM cart_items WHERE cart_id = p_cart_id;

    RETURN json_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
