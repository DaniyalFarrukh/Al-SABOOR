'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NotificationDispatcher } from '../providers/notifications/Dispatcher'

export async function getAdminOrders(orderType: 'customer' | 'wholesale' | 'all' = 'all') {
  const { createAdminClient } = await import('@/utils/supabase/admin')
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, order_source, grand_total, status, payment_method, payment_status, created_at,
      customer_first_name, customer_last_name, customer_email, customer_phone,
      profiles:user_id ( roles ( name ) )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  if (orderType === 'all') return data

  return data.filter((order: any) => {
    const roleName = order.profiles?.roles?.name
    const isWholesale = roleName === 'Retailer' || roleName === 'Wholesaler'
    if (orderType === 'wholesale') return isWholesale
    return !isWholesale // customer order (normal user or guest)
  })
}

export async function getAdminOrderDetails(id: string) {
  const { createAdminClient } = await import('@/utils/supabase/admin')
  const supabase = createAdminClient()
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError || !order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select(`
      id, quantity, unit_price, total_price, product_id,
      products (name, sku)
    `)
    .eq('order_id', id)

  const { data: history } = await supabase
    .from('order_history')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  const { data: payments } = await supabase
    .from('payments')
    .select('*, refunds(*)')
    .eq('order_id', id)
    .order('created_at', { ascending: false })
    
  const { data: shipments } = await supabase
    .from('shipments')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  return {
    ...order,
    items: items || [],
    history: history || [],
    payments: payments || [],
    shipments: shipments || []
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string, notes: string = '') {
  const { createAdminClient } = await import('@/utils/supabase/admin')
  const adminClient = createAdminClient()
  
  // Try to get user, but don't fail if we can't (might be a webhook or background job later)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error: updateError } = await adminClient
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (updateError) return { error: updateError.message }

  // Log to history
  await adminClient.from('order_history').insert({
    order_id: orderId,
    status: newStatus as any,
    actor_id: user?.id || null,
    notes: notes || `Status changed to ${newStatus}`
  })

  // Fetch order details for notification
  const { data: order } = await adminClient.from('orders').select('order_number, customer_first_name, customer_email, customer_phone').eq('id', orderId).single()
  
  if (order) {
    let eventType = ''
    if (newStatus === 'confirmed') eventType = 'order_confirmed'
    else if (newStatus === 'shipped') eventType = 'order_shipped'
    else if (newStatus === 'out_for_delivery') eventType = 'out_for_delivery'
    else if (newStatus === 'delivered') eventType = 'delivered'
    else if (newStatus === 'cancelled') eventType = 'cancelled'

    if (eventType) {
      const dispatcher = new NotificationDispatcher()
      await dispatcher.dispatch(eventType, {
        order_id: orderId,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        variables: {
          first_name: order.customer_first_name,
          order_number: order.order_number,
          tracking_number: 'N/A', // Would be dynamically fetched from shipments in a full implementation
          courier: 'N/A'
        }
      })
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/account/orders')
  return { success: true }
}

export async function createManualOrder(formData: any) {
  const { createAdminClient } = await import('@/utils/supabase/admin')
  const adminClient = createAdminClient()

  // Generate order number
  const orderNumber = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()

  // Insert Order
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      order_number: orderNumber,
      order_source: 'manual',
      customer_email: formData.email,
      customer_phone: formData.phone,
      customer_first_name: formData.firstName,
      customer_last_name: formData.lastName,
      shipping_address_line1: formData.addressLine1,
      shipping_address_line2: formData.addressLine2 || null,
      shipping_city: formData.city,
      shipping_state: formData.state || null,
      shipping_postal_code: formData.postalCode || '00000',
      subtotal: formData.subtotal,
      shipping_cost: formData.shippingCost,
      grand_total: formData.grandTotal,
      status: 'pending',
      payment_method: formData.paymentMethod || 'COD',
      payment_status: 'pending',
      admin_notes: formData.adminNotes || null
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { error: orderError?.message || 'Failed to create order' }
  }

  // Insert Order Items
  for (const item of formData.items) {
    const { error: itemError } = await adminClient
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      })
      
    if (!itemError) {
      // Deduct stock via RPC
      await adminClient.rpc('adjust_stock', {
        p_product_id: item.product_id,
        p_variant_id: item.variant_id || null,
        p_quantity_change: -(item.quantity),
        p_reason: 'Manual Order Placement',
        p_reference_id: order.id
      })
    }
  }

  // Create initial order history entry
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await adminClient.from('order_history').insert({
    order_id: order.id,
    status: 'pending',
    actor_id: user?.id || null,
    notes: 'Manual order created by admin'
  })

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  return { success: true, order_id: order.id }
}
