-- Phase 13: Store Settings

-- 1. CREATE SETTINGS TABLE
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    general JSONB DEFAULT '{}'::jsonb NOT NULL,
    policies JSONB DEFAULT '{}'::jsonb NOT NULL,
    shipping JSONB DEFAULT '{}'::jsonb NOT NULL,
    payments JSONB DEFAULT '{}'::jsonb NOT NULL,
    frontend JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one row exists using a unique partial index or standard constraint
-- For simplicity, we just seed one row and use it.
CREATE UNIQUE INDEX single_row_settings ON store_settings ((TRUE));

-- 2. SEED DEFAULT SETTINGS
INSERT INTO store_settings (general, policies, shipping, payments, frontend)
VALUES (
    '{"store_name": "AL SABOOR", "contact_number": "+92 300 1234567", "whatsapp_number": "+92 300 1234567", "email": "info@alsaboor.com", "address": "Karachi, Pakistan", "business_hours": "Mon-Sat 9AM - 6PM"}'::jsonb,
    '{"shipping_policy": "We ship all over Pakistan within 3-5 business days.", "return_policy": "Returns accepted within 7 days.", "refund_policy": "Refunds processed to original payment method.", "privacy_policy": "We do not sell your data.", "terms_of_service": "Standard terms apply."}'::jsonb,
    '{"flat_rate_cost": 200, "free_shipping_threshold": 5000, "delivery_estimate": "3-5 Business Days"}'::jsonb,
    '{"cod": true, "jazzcash": false, "easypaisa": false, "card": false}'::jsonb,
    '{"announcement_bar": "Free shipping on orders over Rs. 5000!", "facebook_url": "", "instagram_url": ""}'::jsonb
);

-- 3. RLS POLICIES
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Public can view store settings" ON store_settings FOR SELECT USING (true);

-- Only admins/superadmins can update
CREATE POLICY "Admins can update settings" ON store_settings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        JOIN roles ON profiles.role_id = roles.id 
        WHERE profiles.id = auth.uid() AND (roles.permissions ? 'superadmin' OR roles.permissions ? 'manage_settings')
    )
);

-- 4. ATTACH AUDIT TRIGGER
DROP TRIGGER IF EXISTS audit_store_settings_trigger ON store_settings;
CREATE TRIGGER audit_store_settings_trigger
AFTER UPDATE ON store_settings
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
