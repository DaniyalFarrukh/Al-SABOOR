-- Phase 4: Pricing and Inventory Expansion
-- STRICT RACE-CONDITION PREVENTION

-- 1. Inventory Expansion
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
ADD CONSTRAINT inventory_product_variant_unique UNIQUE NULLS NOT DISTINCT (product_id, variant_id),
ADD CONSTRAINT check_quantity_non_negative CHECK (quantity >= 0); -- CRITICAL: Prevents negative stock at DB level

-- 2. Product Behavior Flags
ALTER TABLE products
ADD COLUMN IF NOT EXISTS out_of_stock_behavior VARCHAR(50) DEFAULT 'hide'; -- 'hide', 'show', 'notify'

-- 3. Pricing Enhancements
ALTER TABLE product_pricing
ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT false;

-- 4. Transaction-Safe Stock Adjustment RPC
-- This function uses SELECT ... FOR UPDATE to exclusively lock the row during deduction.
CREATE OR REPLACE FUNCTION adjust_stock(
    p_product_id UUID,
    p_variant_id UUID,
    p_quantity_change INTEGER,
    p_reason VARCHAR,
    p_reference_id UUID DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
    v_inventory_id UUID;
    v_current_quantity INTEGER;
    v_new_quantity INTEGER;
BEGIN
    -- 1. Lock the inventory row to prevent race conditions
    SELECT id, quantity INTO v_inventory_id, v_current_quantity
    FROM inventory
    WHERE product_id = p_product_id 
      AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL))
    FOR UPDATE; -- EXCLUSIVE ROW LOCK

    -- 2. If no inventory record exists, abort.
    IF v_inventory_id IS NULL THEN
        RAISE EXCEPTION 'Inventory record not found for product % variant %', p_product_id, p_variant_id;
    END IF;

    -- 3. Calculate new quantity
    v_new_quantity := v_current_quantity + p_quantity_change;

    -- 4. Check negative stock (backup to CHECK constraint)
    IF v_new_quantity < 0 THEN
        RAISE EXCEPTION 'Insufficient stock. Cannot reduce below 0.';
    END IF;

    -- 5. Update Inventory
    UPDATE inventory 
    SET quantity = v_new_quantity, updated_at = now()
    WHERE id = v_inventory_id;

    -- 6. Log the movement
    INSERT INTO stock_movements (inventory_id, quantity_change, reason, reference_id)
    VALUES (v_inventory_id, p_quantity_change, p_reason, p_reference_id);

    RETURN jsonb_build_object(
        'success', true, 
        'inventory_id', v_inventory_id, 
        'old_quantity', v_current_quantity, 
        'new_quantity', v_new_quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expose RPC to authenticated users only (or restricted via RLS/API logic)
-- Revoke from public, allow authenticated
REVOKE EXECUTE ON FUNCTION adjust_stock(UUID, UUID, INTEGER, VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION adjust_stock(UUID, UUID, INTEGER, VARCHAR, UUID) TO authenticated;
