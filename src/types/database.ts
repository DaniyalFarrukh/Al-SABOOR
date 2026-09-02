export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role_id: string | null; first_name: string | null; last_name: string | null; phone: string | null; admin_notes: string | null; is_blocked: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; role_id?: string | null; first_name?: string | null; last_name?: string | null; phone?: string | null; admin_notes?: string | null; is_blocked?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; role_id?: string | null; first_name?: string | null; last_name?: string | null; phone?: string | null; admin_notes?: string | null; is_blocked?: boolean; created_at?: string; updated_at?: string }
      }
      roles: {
        Row: { id: string; name: string; description: string | null; permissions: any; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; description?: string | null; permissions?: any; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; description?: string | null; permissions?: any; created_at?: string; updated_at?: string }
      }
      permissions: {
        Row: { id: string; name: string; description: string | null; created_at: string }
        Insert: { id?: string; name: string; description?: string | null; created_at?: string }
        Update: { id?: string; name?: string; description?: string | null; created_at?: string }
      }
      role_permissions: {
        Row: { role_id: string; permission_id: string; created_at: string }
        Insert: { role_id: string; permission_id: string; created_at?: string }
        Update: { role_id?: string; permission_id?: string; created_at?: string }
      }
      categories: {
        Row: { id: string; name: string; slug: string; parent_id: string | null; meta_title: string | null; meta_description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; slug: string; parent_id?: string | null; meta_title?: string | null; meta_description?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; slug?: string; parent_id?: string | null; meta_title?: string | null; meta_description?: string | null; created_at?: string; updated_at?: string }
      }
      brands: {
        Row: { id: string; name: string; slug: string; logo_url: string | null; meta_title: string | null; meta_description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; slug: string; logo_url?: string | null; meta_title?: string | null; meta_description?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; slug: string; logo_url?: string | null; meta_title?: string | null; meta_description?: string | null; created_at?: string; updated_at?: string }
      }
      products: {
        Row: { id: string; name: string; slug: string; sku: string; description: string | null; is_active: boolean; category_id: string | null; brand_id: string | null; meta_title: string | null; meta_description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; slug: string; sku: string; description?: string | null; is_active?: boolean; category_id?: string | null; brand_id?: string | null; meta_title?: string | null; meta_description?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; slug?: string; sku?: string; description?: string | null; is_active?: boolean; category_id?: string | null; brand_id?: string | null; meta_title?: string | null; meta_description?: string | null; created_at?: string; updated_at?: string }
      }
      product_variants: {
        Row: { id: string; product_id: string; sku: string; name: string; price_override: number | null; options: Json | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; product_id: string; sku: string; name: string; price_override?: number | null; options?: Json | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; product_id?: string; sku?: string; name?: string; price_override?: number | null; options?: Json | null; is_active?: boolean; created_at?: string; updated_at?: string }
      }
      product_images: {
        Row: { id: string; product_id: string; variant_id: string | null; image_url: string; display_order: number | null; is_primary: boolean | null; created_at: string }
        Insert: { id?: string; product_id: string; variant_id?: string | null; image_url: string; display_order?: number | null; is_primary?: boolean | null; created_at?: string }
        Update: { id?: string; product_id?: string; variant_id?: string | null; image_url?: string; display_order?: number | null; is_primary?: boolean | null; created_at?: string }
      }
      product_specifications: {
        Row: { id: string; product_id: string; spec_key: string; spec_value: string; display_order: number | null; created_at: string }
        Insert: { id?: string; product_id: string; spec_key: string; spec_value: string; display_order?: number | null; created_at?: string }
        Update: { id?: string; product_id?: string; spec_key?: string; spec_value?: string; display_order?: number | null; created_at?: string }
      }
      suppliers: {
        Row: { id: string; name: string; contact_name: string | null; phone: string | null; email: string | null; address: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; contact_name?: string | null; phone?: string | null; email?: string | null; address?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; contact_name?: string | null; phone?: string | null; email?: string | null; address?: string | null; created_at?: string; updated_at?: string }
      }
      bike_manufacturers: {
        Row: { id: string; name: string; slug: string; logo_url: string | null; is_active: boolean | null; created_at: string }
        Insert: { id?: string; name: string; slug: string; logo_url?: string | null; is_active?: boolean | null; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; logo_url?: string | null; is_active?: boolean | null; created_at?: string }
      }
      bike_models: {
        Row: { id: string; manufacturer_id: string; name: string; slug: string; is_active: boolean | null; created_at: string }
        Insert: { id?: string; manufacturer_id: string; name: string; slug: string; is_active?: boolean | null; created_at?: string }
        Update: { id?: string; manufacturer_id?: string; name?: string; slug?: string; is_active?: boolean | null; created_at?: string }
      }
      bike_generations: {
        Row: { id: string; model_id: string; name: string; start_year: number; end_year: number | null; created_at: string }
        Insert: { id?: string; model_id: string; name: string; start_year: number; end_year?: number | null; created_at?: string }
        Update: { id?: string; model_id?: string; name?: string; start_year?: number; end_year?: number | null; created_at?: string }
      }
      bike_years: {
        Row: { id: string; generation_id: string; year: number; created_at: string }
        Insert: { id?: string; generation_id: string; year: number; created_at?: string }
        Update: { id?: string; generation_id?: string; year?: number; created_at?: string }
      }
      product_compatibility: {
        Row: { id: string; product_id: string; variant_id: string | null; bike_model_id: string | null; bike_year_id: string | null; created_at: string }
        Insert: { id?: string; product_id: string; variant_id?: string | null; bike_model_id?: string | null; bike_year_id?: string | null; created_at?: string }
        Update: { id?: string; product_id?: string; variant_id?: string | null; bike_model_id?: string | null; bike_year_id?: string | null; created_at?: string }
      }
      product_pricing: {
        Row: { id: string; product_id: string; cost_price: number | null; retail_price: number; sale_price: number | null; sale_start: string | null; sale_end: string | null; is_flash_sale: boolean | null; created_at: string; updated_at: string }
        Insert: { id?: string; product_id: string; cost_price?: number | null; retail_price: number; sale_price?: number | null; sale_start?: string | null; sale_end?: string | null; is_flash_sale?: boolean | null; created_at?: string; updated_at?: string }
        Update: { id?: string; product_id?: string; cost_price?: number | null; retail_price?: number; sale_price?: number | null; sale_start?: string | null; sale_end?: string | null; is_flash_sale?: boolean | null; created_at?: string; updated_at?: string }
      }
      wholesale_pricing_tiers: {
        Row: { id: string; product_id: string; variant_id: string | null; min_quantity: number; price: number; created_at: string }
        Insert: { id?: string; product_id: string; variant_id?: string | null; min_quantity: number; price: number; created_at?: string }
        Update: { id?: string; product_id?: string; variant_id?: string | null; min_quantity?: number; price?: number; created_at?: string }
      }
      inventory: {
        Row: { id: string; product_id: string; variant_id: string | null; quantity: number; low_stock_threshold: number | null; created_at: string; updated_at: string }
        Insert: { id?: string; product_id: string; variant_id?: string | null; quantity?: number; low_stock_threshold?: number | null; created_at?: string; updated_at?: string }
        Update: { id?: string; product_id?: string; variant_id?: string | null; quantity?: number; low_stock_threshold?: number | null; created_at?: string; updated_at?: string }
      }
      stock_movements: {
        Row: { id: string; inventory_id: string; quantity_change: number; reason: string; reference_id: string | null; created_at: string }
        Insert: { id?: string; inventory_id: string; quantity_change: number; reason: string; reference_id?: string | null; created_at?: string }
        Update: { id?: string; inventory_id?: string; quantity_change?: number; reason?: string; reference_id?: string | null; created_at?: string }
      }
      addresses: {
        Row: { id: string; user_id: string; label: string | null; first_name: string; last_name: string; phone: string; street_address: string; city: string; province: string; postal_code: string | null; is_default: boolean | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; label?: string | null; first_name: string; last_name: string; phone: string; street_address: string; city: string; province: string; postal_code?: string | null; is_default?: boolean | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; label?: string | null; first_name?: string; last_name?: string; phone?: string; street_address?: string; city?: string; province?: string; postal_code?: string | null; is_default?: boolean | null; created_at?: string; updated_at?: string }
      }
      orders: {
        Row: { id: string; user_id: string | null; order_number: string; order_source: 'website' | 'whatsapp' | 'phone' | 'manual' | 'other'; subtotal: number; shipping_cost: number; grand_total: number; status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'; payment_method: string; payment_status: 'pending' | 'paid' | 'failed' | 'refunded'; customer_email: string; customer_phone: string; customer_first_name: string; customer_last_name: string; shipping_address_line1: string; shipping_address_line2: string | null; shipping_city: string; shipping_state: string | null; shipping_postal_code: string; admin_notes: string | null; coupon_code: string | null; discount_amount: number; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string | null; order_number?: string; order_source?: 'website' | 'whatsapp' | 'phone' | 'manual' | 'other'; subtotal: number; shipping_cost: number; grand_total: number; status?: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'; payment_method: string; payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'; customer_email: string; customer_phone: string; customer_first_name: string; customer_last_name: string; shipping_address_line1: string; shipping_address_line2?: string | null; shipping_city: string; shipping_state?: string | null; shipping_postal_code: string; admin_notes?: string | null; coupon_code?: string | null; discount_amount?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string | null; order_number?: string; order_source?: 'website' | 'whatsapp' | 'phone' | 'manual' | 'other'; subtotal?: number; shipping_cost?: number; grand_total?: number; status?: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned'; payment_method?: string; payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'; customer_email?: string; customer_phone?: string; customer_first_name?: string; customer_last_name?: string; shipping_address_line1?: string; shipping_address_line2?: string | null; shipping_city?: string; shipping_state?: string | null; shipping_postal_code?: string; admin_notes?: string | null; coupon_code?: string | null; discount_amount?: number; created_at?: string; updated_at?: string }
      }
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; variant_id: string | null; quantity: number; unit_price: number; total_price: number; created_at: string }
        Insert: { id?: string; order_id: string; product_id?: string | null; variant_id?: string | null; quantity: number; unit_price: number; total_price: number; created_at?: string }
        Update: { id?: string; order_id?: string; product_id?: string | null; variant_id?: string | null; quantity?: number; unit_price?: number; total_price?: number; created_at?: string }
      }
      order_history: {
        Row: { id: string; order_id: string; status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'; actor_id: string | null; notes: string | null; created_at: string }
        Insert: { id?: string; order_id: string; status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'; actor_id?: string | null; notes?: string | null; created_at?: string }
        Update: { id?: string; order_id?: string; status?: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'; actor_id?: string | null; notes?: string | null; created_at?: string }
      }
      carts: {
        Row: { id: string; user_id: string | null; status: 'active' | 'abandoned' | 'converted'; created_at: string; updated_at: string }
        Insert: { id?: string; user_id?: string | null; status?: 'active' | 'abandoned' | 'converted'; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string | null; status?: 'active' | 'abandoned' | 'converted'; created_at?: string; updated_at?: string }
      }
      payments: {
        Row: { id: string; order_id: string; provider: 'COD' | 'JazzCash' | 'Easypaisa' | 'Card'; amount: number; status: 'pending' | 'paid' | 'failed' | 'refunded'; transaction_reference: string | null; idempotency_key: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; order_id: string; provider: 'COD' | 'JazzCash' | 'Easypaisa' | 'Card'; amount: number; status?: 'pending' | 'paid' | 'failed' | 'refunded'; transaction_reference?: string | null; idempotency_key?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; order_id?: string; provider?: 'COD' | 'JazzCash' | 'Easypaisa' | 'Card'; amount?: number; status?: 'pending' | 'paid' | 'failed' | 'refunded'; transaction_reference?: string | null; idempotency_key?: string | null; created_at?: string; updated_at?: string }
      }
      refunds: {
        Row: { id: string; payment_id: string; order_id: string; amount: number; status: 'pending' | 'completed' | 'failed'; refund_reference: string | null; reason: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; payment_id: string; order_id: string; amount: number; status?: 'pending' | 'completed' | 'failed'; refund_reference?: string | null; reason?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; payment_id?: string; order_id?: string; amount?: number; status?: 'pending' | 'completed' | 'failed'; refund_reference?: string | null; reason?: string | null; created_at?: string; updated_at?: string }
      }
      shipping_zones: {
        Row: { id: string; name: string; is_active: boolean; created_at: string }
        Insert: { id?: string; name: string; is_active?: boolean; created_at?: string }
        Update: { id?: string; name?: string; is_active?: boolean; created_at?: string }
      }
      shipping_rules: {
        Row: { id: string; zone_id: string; base_cost: number; free_shipping_threshold: number | null; city_region_regex: string | null; created_at: string }
        Insert: { id?: string; zone_id: string; base_cost: number; free_shipping_threshold?: number | null; city_region_regex?: string | null; created_at?: string }
        Update: { id?: string; zone_id?: string; base_cost?: number; free_shipping_threshold?: number | null; city_region_regex?: string | null; created_at?: string }
      }
      shipments: {
        Row: { id: string; order_id: string; courier_name: string; tracking_number: string | null; tracking_url: string | null; status: 'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'returned_to_sender'; estimated_delivery_date: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; order_id: string; courier_name: string; tracking_number?: string | null; tracking_url?: string | null; status?: 'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'returned_to_sender'; estimated_delivery_date?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; order_id?: string; courier_name?: string; tracking_number?: string | null; tracking_url?: string | null; status?: 'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'returned_to_sender'; estimated_delivery_date?: string | null; created_at?: string; updated_at?: string }
      }
      returns: {
        Row: { id: string; order_id: string; user_id: string | null; status: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded'; reason: string; admin_notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; order_id: string; user_id?: string | null; status?: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded'; reason: string; admin_notes?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; order_id?: string; user_id?: string | null; status?: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded'; reason?: string; admin_notes?: string | null; created_at?: string; updated_at?: string }
      }
      return_items: {
        Row: { id: string; return_id: string; order_item_id: string; quantity_returned: number; condition: string | null; created_at: string }
        Insert: { id?: string; return_id: string; order_item_id: string; quantity_returned: number; condition?: string | null; created_at?: string }
        Update: { id?: string; return_id?: string; order_item_id?: string; quantity_returned?: number; condition?: string | null; created_at?: string }
      }
      reviews: {
        Row: { id: string; product_id: string; user_id: string; rating: number; title: string | null; comment: string | null; is_verified: boolean; status: 'pending' | 'approved' | 'rejected' | 'reported'; admin_notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; product_id: string; user_id: string; rating: number; title?: string | null; comment?: string | null; is_verified?: boolean; status?: 'pending' | 'approved' | 'rejected' | 'reported'; admin_notes?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; product_id?: string; user_id?: string; rating?: number; title?: string | null; comment?: string | null; is_verified?: boolean; status?: 'pending' | 'approved' | 'rejected' | 'reported'; admin_notes?: string | null; created_at?: string; updated_at?: string }
      }
      coupons: {
        Row: { id: string; code: string; discount_type: 'flat' | 'percentage'; discount_value: number; min_order_value: number | null; max_discount: number | null; start_date: string | null; end_date: string | null; usage_limit: number | null; per_customer_limit: number | null; is_active: boolean; created_at: string }
        Insert: { id?: string; code: string; discount_type: 'flat' | 'percentage'; discount_value: number; min_order_value?: number | null; max_discount?: number | null; start_date?: string | null; end_date?: string | null; usage_limit?: number | null; per_customer_limit?: number | null; is_active?: boolean; created_at?: string }
        Update: { id?: string; code?: string; discount_type?: 'flat' | 'percentage'; discount_value?: number; min_order_value?: number | null; max_discount?: number | null; start_date?: string | null; end_date?: string | null; usage_limit?: number | null; per_customer_limit?: number | null; is_active?: boolean; created_at?: string }
      }
      coupon_usage: {
        Row: { id: string; coupon_id: string; user_id: string; order_id: string; discount_applied: number; created_at: string }
        Insert: { id?: string; coupon_id: string; user_id: string; order_id: string; discount_applied: number; created_at?: string }
        Update: { id?: string; coupon_id?: string; user_id?: string; order_id?: string; discount_applied?: number; created_at?: string }
      }
      promotions: {
        Row: { id: string; title: string; type: 'flash_sale' | 'banner' | 'featured'; start_date: string; end_date: string; is_active: boolean; created_at: string }
        Insert: { id?: string; title: string; type: 'flash_sale' | 'banner' | 'featured'; start_date: string; end_date: string; is_active?: boolean; created_at?: string }
        Update: { id?: string; title?: string; type?: 'flash_sale' | 'banner' | 'featured'; start_date?: string; end_date?: string; is_active?: boolean; created_at?: string }
      }
      promotion_items: {
        Row: { id: string; promotion_id: string; product_id: string; promotional_price: number; created_at: string }
        Insert: { id?: string; promotion_id: string; product_id: string; promotional_price: number; created_at?: string }
        Update: { id?: string; promotion_id?: string; product_id?: string; promotional_price?: number; created_at?: string }
      }
      notifications: {
        Row: { id: string; user_id: string | null; order_id: string | null; type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_update' | 'refund_update' | 'admin_new_order' | 'admin_low_stock' | 'admin_payment_issue' | 'admin_return_request'; channel: 'email' | 'sms' | 'whatsapp' | 'in_app'; status: 'pending' | 'sent' | 'failed'; payload: any | null; error_message: string | null; created_at: string; sent_at: string | null }
        Insert: { id?: string; user_id?: string | null; order_id?: string | null; type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_update' | 'refund_update' | 'admin_new_order' | 'admin_low_stock' | 'admin_payment_issue' | 'admin_return_request'; channel: 'email' | 'sms' | 'whatsapp' | 'in_app'; status?: 'pending' | 'sent' | 'failed'; payload?: any | null; error_message?: string | null; created_at?: string; sent_at?: string | null }
        Update: { id?: string; user_id?: string | null; order_id?: string | null; type?: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_update' | 'refund_update' | 'admin_new_order' | 'admin_low_stock' | 'admin_payment_issue' | 'admin_return_request'; channel?: 'email' | 'sms' | 'whatsapp' | 'in_app'; status?: 'pending' | 'sent' | 'failed'; payload?: any | null; error_message?: string | null; created_at?: string; sent_at?: string | null }
      }
      notification_templates: {
        Row: { id: string; type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_update' | 'refund_update' | 'admin_new_order' | 'admin_low_stock' | 'admin_payment_issue' | 'admin_return_request'; channel: 'email' | 'sms' | 'whatsapp' | 'in_app'; subject: string | null; body_template: string; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_update' | 'refund_update' | 'admin_new_order' | 'admin_low_stock' | 'admin_payment_issue' | 'admin_return_request'; channel: 'email' | 'sms' | 'whatsapp' | 'in_app'; subject?: string | null; body_template: string; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; type?: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_update' | 'refund_update' | 'admin_new_order' | 'admin_low_stock' | 'admin_payment_issue' | 'admin_return_request'; channel?: 'email' | 'sms' | 'whatsapp' | 'in_app'; subject?: string | null; body_template?: string; is_active?: boolean; created_at?: string; updated_at?: string }
      }
      activity_logs: {
        Row: { id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string; old_value: any | null; new_value: any | null; created_at: string }
        Insert: { id?: string; actor_id?: string | null; action: string; entity_type: string; entity_id: string; old_value?: any | null; new_value?: any | null; created_at?: string }
        Update: { id?: string; actor_id?: string | null; action?: string; entity_type?: string; entity_id?: string; old_value?: any | null; new_value?: any | null; created_at?: string }
      }
      store_settings: {
        Row: { id: string; general: any; policies: any; shipping: any; payments: any; frontend: any; updated_at: string }
        Insert: { id?: string; general?: any; policies?: any; shipping?: any; payments?: any; frontend?: any; updated_at?: string }
        Update: { id?: string; general?: any; policies?: any; shipping?: any; payments?: any; frontend?: any; updated_at?: string }
      }
      cart_items: {
        Row: { id: string; cart_id: string; product_id: string; variant_id: string | null; quantity: number; created_at: string; updated_at: string }
        Insert: { id?: string; cart_id: string; product_id: string; variant_id?: string | null; quantity?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; cart_id?: string; product_id?: string; variant_id?: string | null; quantity?: number; created_at?: string; updated_at?: string }
      }
      wishlists: {
        Row: { user_id: string; product_id: string; created_at: string }
        Insert: { user_id: string; product_id: string; created_at?: string }
        Update: { user_id?: string; product_id?: string; created_at?: string }
      }
      customer_addresses: {
        Row: { id: string; user_id: string; address_type: 'shipping' | 'billing' | 'both'; first_name: string; last_name: string; phone: string; address_line1: string; address_line2: string | null; city: string; state: string | null; postal_code: string; is_default: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; address_type?: 'shipping' | 'billing' | 'both'; first_name: string; last_name: string; phone: string; address_line1: string; address_line2?: string | null; city: string; state?: string | null; postal_code: string; is_default?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; address_type?: 'shipping' | 'billing' | 'both'; first_name?: string; last_name?: string; phone?: string; address_line1?: string; address_line2?: string | null; city?: string; state?: string | null; postal_code?: string; is_default?: boolean; created_at?: string; updated_at?: string }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_product_id: string
          p_variant_id?: string
          p_quantity_change: number
          p_reason: string
          p_reference_id?: string
        }
        Returns: Json
      }
      checkout_cart: {
        Args: {
          p_cart_id: string
          p_user_id: string | null
          p_order_source: 'website' | 'whatsapp' | 'phone' | 'manual' | 'other'
          p_customer_email: string
          p_customer_phone: string
          p_customer_first_name: string
          p_customer_last_name: string
          p_shipping_address_line1: string
          p_shipping_address_line2: string | null
          p_shipping_city: string
          p_shipping_state: string | null
          p_shipping_postal_code: string
          p_payment_method: string
          p_shipping_cost: number
        }
        Returns: Json
      }
    }
    Enums: {
      order_status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
  }
}
