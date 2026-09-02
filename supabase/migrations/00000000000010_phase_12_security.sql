-- Phase 12: Security, RBAC, and Audit Logging

-- 1. SEED ROLES
-- Upsert Owner Role
INSERT INTO roles (id, name, description, permissions) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Owner', 'Full system access', '["superadmin"]')
ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Upsert Staff Role
INSERT INTO roles (id, name, description, permissions) 
VALUES ('00000000-0000-0000-0000-000000000002', 'Staff', 'Limited operational access', '["view_products", "manage_products", "view_orders", "manage_orders", "view_customers", "manage_inventory"]')
ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

-- 2. ACTIVITY LOGS TABLE
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null for system actions
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    entity_type VARCHAR(100) NOT NULL, -- Table name
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for activity logs (only superadmin can view)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins can view activity logs" ON activity_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        JOIN roles ON profiles.role_id = roles.id 
        WHERE profiles.id = auth.uid() AND roles.permissions ? 'superadmin'
    )
);

-- 3. AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id UUID;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    -- Extract user ID from JWT if available (auth.uid() securely parses the token)
    v_actor_id := auth.uid();
    
    -- We only care about logging if it's an authenticated user doing it (mostly admins).
    -- If it's a system service role, auth.uid() might be null.
    -- We will log it anyway to track system changes, but actor_id will be null.
    
    IF TG_OP = 'INSERT' THEN
        v_new_data := row_to_json(NEW);
        INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, new_value)
        VALUES (v_actor_id, TG_OP, TG_TABLE_NAME, NEW.id, v_new_data);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := row_to_json(OLD);
        v_new_data := row_to_json(NEW);
        
        -- Only log if something actually changed
        IF v_old_data IS DISTINCT FROM v_new_data THEN
            INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, old_value, new_value)
            VALUES (v_actor_id, TG_OP, TG_TABLE_NAME, NEW.id, v_old_data, v_new_data);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_old_data := row_to_json(OLD);
        INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, old_value)
        VALUES (v_actor_id, TG_OP, TG_TABLE_NAME, OLD.id, v_old_data);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATTACH TRIGGERS TO SENSITIVE TABLES
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
CREATE TRIGGER audit_products_trigger
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

DROP TRIGGER IF EXISTS audit_product_pricing_trigger ON product_pricing;
CREATE TRIGGER audit_product_pricing_trigger
AFTER INSERT OR UPDATE OR DELETE ON product_pricing
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

DROP TRIGGER IF EXISTS audit_inventory_trigger ON inventory;
CREATE TRIGGER audit_inventory_trigger
AFTER INSERT OR UPDATE OR DELETE ON inventory
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

DROP TRIGGER IF EXISTS audit_orders_trigger ON orders;
CREATE TRIGGER audit_orders_trigger
AFTER UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

DROP TRIGGER IF EXISTS audit_coupons_trigger ON coupons;
CREATE TRIGGER audit_coupons_trigger
AFTER INSERT OR UPDATE OR DELETE ON coupons
FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
