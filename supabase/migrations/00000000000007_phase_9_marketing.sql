-- Phase 9: Reviews, Coupons, and Promotions

-- 1. ENUMS
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'reported');
CREATE TYPE discount_type AS ENUM ('flat', 'percentage');
CREATE TYPE promotion_type AS ENUM ('flash_sale', 'banner', 'featured');

-- 2. REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    status review_status DEFAULT 'approved' NOT NULL, -- Auto-approve by default per policy
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to verify purchase automatically
CREATE OR REPLACE FUNCTION verify_product_purchase()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = NEW.user_id AND oi.product_id = NEW.product_id AND o.status != 'cancelled'
    ) THEN
        NEW.is_verified = true;
    ELSE
        NEW.is_verified = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_verified_purchase
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION verify_product_purchase();

-- 3. COUPONS
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2),
    max_discount DECIMAL(10,2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    per_customer_limit INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    discount_applied DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PROMOTIONS
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type promotion_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE promotion_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    promotional_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(promotion_id, product_id)
);

-- Add coupon tracking to orders table
ALTER TABLE orders 
ADD COLUMN coupon_code VARCHAR(50),
ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;

-- 5. UPDATE CHECKOUT RPC
-- Drop the old one first because we are changing the signature
DROP FUNCTION IF EXISTS checkout_cart(UUID, UUID, order_source, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DECIMAL);

CREATE OR REPLACE FUNCTION checkout_cart(
    p_cart_id UUID,
    p_user_id UUID,
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
    p_shipping_cost DECIMAL,
    p_coupon_code VARCHAR DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_product_price RECORD;
    v_unit_price DECIMAL;
    v_subtotal DECIMAL := 0;
    v_grand_total DECIMAL := 0;
    v_discount_amount DECIMAL := 0;
    v_order_id UUID;
    v_order_number VARCHAR;
    v_stock_available INTEGER;
    
    v_coupon RECORD;
    v_user_uses INTEGER;
    v_global_uses INTEGER;
    v_promo_item RECORD;
    v_has_flash_sale_item BOOLEAN := false;
BEGIN
    -- Generate order number
    v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

    -- Loop through cart items and lock rows
    FOR v_item IN (SELECT * FROM cart_items WHERE cart_id = p_cart_id) LOOP
        
        -- Lock inventory
        SELECT quantity INTO v_stock_available 
        FROM inventory 
        WHERE product_id = v_item.product_id 
          AND (variant_id = v_item.variant_id OR (variant_id IS NULL AND v_item.variant_id IS NULL))
        FOR UPDATE;

        IF NOT FOUND OR v_stock_available < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_item.product_id;
        END IF;

        -- Check active flash sales first!
        SELECT pi.promotional_price INTO v_promo_item
        FROM promotion_items pi
        JOIN promotions p ON p.id = pi.promotion_id
        WHERE pi.product_id = v_item.product_id 
          AND p.type = 'flash_sale'
          AND p.is_active = true
          AND now() BETWEEN p.start_date AND p.end_date
        LIMIT 1;

        IF FOUND THEN
            v_unit_price := v_promo_item.promotional_price;
            v_has_flash_sale_item := true;
        ELSE
            -- Normal pricing
            SELECT retail_price, sale_price INTO v_product_price 
            FROM product_pricing 
            WHERE product_id = v_item.product_id;
            
            v_unit_price := COALESCE(v_product_price.sale_price, v_product_price.retail_price);
        END IF;

        v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
    END LOOP;

    -- Validate Coupon
    IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
        IF v_has_flash_sale_item THEN
            RAISE EXCEPTION 'Coupons cannot be applied to carts containing flash sale items.';
        END IF;

        SELECT * INTO v_coupon FROM coupons 
        WHERE code = upper(p_coupon_code) AND is_active = true 
          AND (start_date IS NULL OR now() >= start_date)
          AND (end_date IS NULL OR now() <= end_date);

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid or expired coupon code.';
        END IF;

        IF v_coupon.min_order_value IS NOT NULL AND v_subtotal < v_coupon.min_order_value THEN
            RAISE EXCEPTION 'Order subtotal does not meet the minimum requirement for this coupon.';
        END IF;

        IF v_coupon.usage_limit IS NOT NULL THEN
            SELECT COUNT(*) INTO v_global_uses FROM coupon_usage WHERE coupon_id = v_coupon.id;
            IF v_global_uses >= v_coupon.usage_limit THEN
                RAISE EXCEPTION 'Coupon usage limit reached.';
            END IF;
        END IF;

        IF p_user_id IS NOT NULL AND v_coupon.per_customer_limit IS NOT NULL THEN
            SELECT COUNT(*) INTO v_user_uses FROM coupon_usage WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
            IF v_user_uses >= v_coupon.per_customer_limit THEN
                RAISE EXCEPTION 'You have exceeded the usage limit for this coupon.';
            END IF;
        END IF;

        -- Calculate discount
        IF v_coupon.discount_type = 'flat' THEN
            v_discount_amount := v_coupon.discount_value;
        ELSE
            v_discount_amount := v_subtotal * (v_coupon.discount_value / 100);
            IF v_coupon.max_discount IS NOT NULL AND v_discount_amount > v_coupon.max_discount THEN
                v_discount_amount := v_coupon.max_discount;
            END IF;
        END IF;

        -- Prevent negative totals
        IF v_discount_amount > v_subtotal THEN
            v_discount_amount := v_subtotal;
        END IF;
    END IF;

    v_grand_total := (v_subtotal - v_discount_amount) + p_shipping_cost;

    -- Create Order Record
    INSERT INTO orders (
        user_id, order_number, order_source, subtotal, shipping_cost, grand_total, 
        status, payment_method, payment_status, 
        customer_email, customer_phone, customer_first_name, customer_last_name,
        shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code,
        coupon_code, discount_amount
    ) VALUES (
        p_user_id, v_order_number, p_order_source, v_subtotal, p_shipping_cost, v_grand_total,
        'pending', p_payment_method, 'pending',
        p_customer_email, p_customer_phone, p_customer_first_name, p_customer_last_name,
        p_shipping_address_line1, p_shipping_address_line2, p_shipping_city, p_shipping_state, p_shipping_postal_code,
        p_coupon_code, v_discount_amount
    ) RETURNING id INTO v_order_id;

    -- Record coupon usage
    IF v_discount_amount > 0 AND p_user_id IS NOT NULL THEN
        INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_applied)
        VALUES (v_coupon.id, p_user_id, v_order_id, v_discount_amount);
    END IF;

    -- Insert Order Items & Deduct Stock
    FOR v_item IN (SELECT * FROM cart_items WHERE cart_id = p_cart_id) LOOP
        
        -- Price again (including flash sale logic)
        SELECT pi.promotional_price INTO v_promo_item
        FROM promotion_items pi
        JOIN promotions p ON p.id = pi.promotion_id
        WHERE pi.product_id = v_item.product_id AND p.type = 'flash_sale' AND p.is_active = true AND now() BETWEEN p.start_date AND p.end_date LIMIT 1;

        IF FOUND THEN
            v_unit_price := v_promo_item.promotional_price;
        ELSE
            SELECT retail_price, sale_price INTO v_product_price FROM product_pricing WHERE product_id = v_item.product_id;
            v_unit_price := COALESCE(v_product_price.sale_price, v_product_price.retail_price);
        END IF;

        -- Insert Order Item
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, total_price)
        VALUES (v_order_id, v_item.product_id, v_item.variant_id, v_item.quantity, v_unit_price, v_unit_price * v_item.quantity);

        -- Deduct stock using the RPC created in Phase 4
        PERFORM adjust_stock(v_item.product_id, v_item.variant_id, -(v_item.quantity), 'Order Placement', v_order_id);

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

-- 6. RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (user_id = auth.uid());

-- Expose coupons only partially if active
CREATE POLICY "Active coupons public" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Promotions public" ON promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Promotion items public" ON promotion_items FOR SELECT USING (true);
