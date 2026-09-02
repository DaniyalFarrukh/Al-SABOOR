-- Phase 11: Analytics and Reporting

-- 1. ADD PERMISSIONS TO ROLES
ALTER TABLE roles
ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb NOT NULL;

-- 2. CREATE DASHBOARD RPC
CREATE OR REPLACE FUNCTION admin_dashboard_stats(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_total_revenue DECIMAL := 0;
    v_total_discounts DECIMAL := 0;
    v_total_shipping DECIMAL := 0;
    v_total_refunds DECIMAL := 0;
    v_net_revenue DECIMAL := 0;
    v_total_orders INTEGER := 0;
    v_average_order_value DECIMAL := 0;
    v_total_customers INTEGER := 0;
    
    v_start TIMESTAMP WITH TIME ZONE;
    v_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Handle default dates (last 30 days if not provided)
    IF p_start_date IS NULL THEN
        v_start := now() - interval '30 days';
    ELSE
        v_start := p_start_date;
    END IF;
    
    IF p_end_date IS NULL THEN
        v_end := now();
    ELSE
        v_end := p_end_date;
    END IF;

    -- Calculate Totals from Orders (only completed/shipped/delivered, not cancelled or returned for base revenue)
    SELECT 
        COALESCE(SUM(subtotal), 0),
        COALESCE(SUM(discount_amount), 0),
        COALESCE(SUM(shipping_cost), 0),
        COUNT(id)
    INTO 
        v_total_revenue,
        v_total_discounts,
        v_total_shipping,
        v_total_orders
    FROM orders
    WHERE created_at >= v_start AND created_at <= v_end
      AND status NOT IN ('cancelled', 'returned');

    -- Calculate total refunds processed in this period
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_refunds
    FROM refunds
    WHERE created_at >= v_start AND created_at <= v_end;

    -- Net Revenue = (Gross Subtotal - Discounts + Shipping) - Refunds
    -- Since grand_total = subtotal - discount + shipping, we can just sum grand_total - refunds
    SELECT COALESCE(SUM(grand_total), 0) INTO v_net_revenue
    FROM orders
    WHERE created_at >= v_start AND created_at <= v_end
      AND status NOT IN ('cancelled', 'returned');
      
    v_net_revenue := v_net_revenue - v_total_refunds;

    -- Average Order Value
    IF v_total_orders > 0 THEN
        v_average_order_value := v_net_revenue / v_total_orders;
    END IF;

    -- Total Unique Customers who ordered in this period
    SELECT COUNT(DISTINCT user_id)
    INTO v_total_customers
    FROM orders
    WHERE created_at >= v_start AND created_at <= v_end
      AND user_id IS NOT NULL;

    -- Return JSON payload
    RETURN json_build_object(
        'gross_revenue', v_total_revenue,
        'total_discounts', v_total_discounts,
        'total_shipping', v_total_shipping,
        'total_refunds', v_total_refunds,
        'net_revenue', v_net_revenue,
        'total_orders', v_total_orders,
        'average_order_value', v_average_order_value,
        'total_customers', v_total_customers,
        'start_date', v_start,
        'end_date', v_end
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
