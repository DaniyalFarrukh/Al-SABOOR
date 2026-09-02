-- Phase 8: Payments, Shipping, Returns & Refunds

-- 1. NEW ENUMS
CREATE TYPE payment_provider AS ENUM ('COD', 'JazzCash', 'Easypaisa', 'Card');
CREATE TYPE shipment_status AS ENUM ('pending', 'dispatched', 'in_transit', 'delivered', 'returned_to_sender');
CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'received', 'refunded');
CREATE TYPE refund_status AS ENUM ('pending', 'completed', 'failed');

-- 2. PAYMENTS & REFUNDS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    provider payment_provider NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,
    transaction_reference VARCHAR(255),
    idempotency_key VARCHAR(255) UNIQUE, -- Protects against duplicate webhooks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status refund_status DEFAULT 'pending' NOT NULL,
    refund_reference VARCHAR(255),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect against duplicate refunds exceeding original payment
CREATE OR REPLACE FUNCTION validate_refund_amount()
RETURNS TRIGGER AS $$
DECLARE
    v_total_refunded DECIMAL(10, 2);
    v_payment_amount DECIMAL(10, 2);
BEGIN
    SELECT amount INTO v_payment_amount FROM payments WHERE id = NEW.payment_id;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_refunded FROM refunds WHERE payment_id = NEW.payment_id AND id != NEW.id AND status != 'failed';
    
    IF (v_total_refunded + NEW.amount) > v_payment_amount THEN
        RAISE EXCEPTION 'Total refunds (%) cannot exceed original payment amount (%)', (v_total_refunded + NEW.amount), v_payment_amount;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_refund_amount
BEFORE INSERT OR UPDATE ON refunds
FOR EACH ROW EXECUTE FUNCTION validate_refund_amount();

-- 3. SHIPPING & LOGISTICS
CREATE TABLE shipping_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE shipping_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE NOT NULL,
    base_cost DECIMAL(10, 2) NOT NULL,
    free_shipping_threshold DECIMAL(10, 2),
    city_region_regex TEXT, -- Optional regex to match shipping_city from order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    courier_name VARCHAR(255) NOT NULL,
    tracking_number VARCHAR(255),
    tracking_url TEXT,
    status shipment_status DEFAULT 'pending' NOT NULL,
    estimated_delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RETURNS
CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status return_status DEFAULT 'requested' NOT NULL,
    reason TEXT NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES returns(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE RESTRICT NOT NULL,
    quantity_returned INTEGER NOT NULL CHECK (quantity_returned > 0),
    condition VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RLS POLICIES
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

-- Shipping zones/rules are public to read
CREATE POLICY "Shipping zones are publicly viewable" ON shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Shipping rules are publicly viewable" ON shipping_rules FOR SELECT USING (true);

-- Users can view their own data
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can view own refunds" ON refunds FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = refunds.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can view own shipments" ON shipments FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Users can view own returns" ON returns FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own returns" ON returns FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own return items" ON return_items FOR SELECT USING (EXISTS (SELECT 1 FROM returns WHERE returns.id = return_items.return_id AND returns.user_id = auth.uid()));
CREATE POLICY "Users can insert own return items" ON return_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM returns WHERE returns.id = return_items.return_id AND returns.user_id = auth.uid()));

-- 6. DATA SEEDING
INSERT INTO shipping_zones (name, is_active) VALUES ('Nationwide', true);
INSERT INTO shipping_rules (zone_id, base_cost, free_shipping_threshold) 
SELECT id, 250, 5000 FROM shipping_zones WHERE name = 'Nationwide';
