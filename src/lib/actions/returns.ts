'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function requestReturn(orderId: string, reason: string, items: { orderItemId: string, quantity: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Create Return request
  const { data: returnData, error: returnError } = await supabase
    .from('returns')
    .insert({
      order_id: orderId,
      user_id: user.id,
      status: 'requested',
      reason
    })
    .select()
    .single()

  if (returnError) return { error: returnError.message }

  // Insert Return Items
  const returnItemsPayload = items.map(i => ({
    return_id: returnData.id,
    order_item_id: i.orderItemId,
    quantity_returned: i.quantity
  }))

  const { error: itemsError } = await supabase.from('return_items').insert(returnItemsPayload)
  if (itemsError) return { error: itemsError.message }

  // Log to order history
  await supabase.from('order_history').insert({
    order_id: orderId,
    status: 'returned',
    actor_id: user.id,
    notes: 'Return requested by customer.'
  })

  revalidatePath('/account/orders')
  return { success: true }
}

export async function processAdminReturn(returnId: string, action: 'approve' | 'reject' | 'receive', notes: string = '') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const statusMap = {
    'approve': 'approved',
    'reject': 'rejected',
    'receive': 'received'
  }

  const newStatus = statusMap[action]
  
  const { error } = await supabase
    .from('returns')
    .update({ status: newStatus as any, admin_notes: notes })
    .eq('id', returnId)

  if (error) return { error: error.message }

  // If received, admin can now trigger stock restore manually or we do it here
  if (action === 'receive') {
    const { data: returnItems } = await supabase
      .from('return_items')
      .select('*, order_items(product_id, variant_id)')
      .eq('return_id', returnId)

    if (returnItems) {
      for (const item of returnItems) {
        await supabase.rpc('adjust_stock', {
          p_product_id: item.order_items.product_id,
          p_variant_id: item.order_items.variant_id,
          p_quantity_change: item.quantity_returned, // Add back stock
          p_reason: 'Return received in good condition',
          p_reference_id: returnId
        })
      }
    }
  }

  revalidatePath('/admin/returns')
  return { success: true }
}
