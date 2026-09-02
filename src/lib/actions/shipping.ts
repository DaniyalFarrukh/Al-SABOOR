'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addShipment(orderId: string, courierName: string, trackingNumber: string) {
  const supabase = await createClient()
  
  // Create Shipment
  const { error } = await supabase.from('shipments').insert({
    order_id: orderId,
    courier_name: courierName,
    tracking_number: trackingNumber,
    status: 'dispatched'
  })

  if (error) return { error: error.message }

  // Update Order Status
  await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId)
  
  // Log history
  await supabase.from('order_history').insert({
    order_id: orderId,
    status: 'shipped',
    notes: `Shipped via ${courierName}. Tracking: ${trackingNumber}`
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

export async function getShippingZones() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shipping_zones')
    .select('*, shipping_rules(*)')
  return data || []
}
