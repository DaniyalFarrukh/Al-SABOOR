-- Phase 10: Customer Management & Notifications

-- 1. EXTEND PROFILES FOR CRM
ALTER TABLE profiles 
ADD COLUMN admin_notes TEXT,
ADD COLUMN is_blocked BOOLEAN DEFAULT false NOT NULL;

-- 2. ENUMS
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'in_app');
CREATE TYPE notification_type AS ENUM (
    'order_placed', 'order_confirmed', 'order_shipped', 'out_for_delivery', 
    'delivered', 'cancelled', 'return_update', 'refund_update',
    'admin_new_order', 'admin_low_stock', 'admin_payment_issue', 'admin_return_request'
);
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- 3. NOTIFICATION ARCHITECTURE
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    subject VARCHAR(255), -- mostly for email
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(type, channel)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Nullable for admin alerts
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE, -- Link context to order
    type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    status notification_status DEFAULT 'pending' NOT NULL,
    payload JSONB, -- The raw payload sent to the provider
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- 4. RLS POLICIES
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Customers can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

-- Insert some default notification templates
INSERT INTO notification_templates (type, channel, subject, body_template) VALUES
('order_placed', 'email', 'Your Order {{order_number}} is Placed', 'Hi {{first_name}}, we have received your order {{order_number}} for Rs. {{grand_total}}.'),
('order_placed', 'whatsapp', NULL, 'Hi {{first_name}}, we have received your order {{order_number}} for Rs. {{grand_total}}. We will notify you when it ships.'),
('order_shipped', 'email', 'Your Order {{order_number}} has Shipped!', 'Great news! Order {{order_number}} is on the way. Tracking: {{tracking_number}}'),
('order_shipped', 'whatsapp', NULL, 'Great news! Order {{order_number}} is on the way via {{courier}}. Tracking: {{tracking_number}}');
