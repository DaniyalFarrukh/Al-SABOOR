'use server'

import { createClient } from '@/utils/supabase/server'
import { getCart } from './cart'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { NotificationDispatcher } from '../providers/notifications/Dispatcher'

export async function processCheckout(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user and cart
  const cartData = await getCart()
  if (!cartData || !cartData.cart) {
    return { error: 'Your cart is empty or expired.' }
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Extract form data
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const addressLine1 = formData.get('address_line1') as string
  const addressLine2 = formData.get('address_line2') as string || null
  const city = formData.get('city') as string
  const state = formData.get('state') as string || null
  const postalCode = formData.get('postal_code') as string
  
  // Payment info
  const paymentMethod = formData.get('payment_method') as string || 'COD'
  const couponCode = formData.get('coupon_code') as string || null
  
  const shippingCost = 250 // Flat rate

  // Call the transactional RPC to process checkout
  const { data, error } = await supabase.rpc('checkout_cart', {
    p_cart_id: cartData.cart.id,
    p_user_id: user?.id || null,
    p_order_source: 'website',
    p_customer_email: email,
    p_customer_phone: phone,
    p_customer_first_name: firstName,
    p_customer_last_name: lastName,
    p_shipping_address_line1: addressLine1,
    p_shipping_address_line2: addressLine2,
    p_shipping_city: city,
    p_shipping_state: state,
    p_shipping_postal_code: postalCode,
    p_payment_method: paymentMethod,
    p_shipping_cost: shippingCost,
    p_coupon_code: couponCode
  })

  if (error) {
    console.error("RPC Error during checkout:", error)
    throw new Error(error.message || 'An error occurred during checkout.')
  }

  // data will contain { success: true, order_id: '...', order_number: '...' }
  const result = data as any

  if (result && result.success) {
    // Dispatch Notifications
    const dispatcher = new NotificationDispatcher()
    await dispatcher.dispatch('order_placed', {
      order_id: result.order_id,
      user_id: user?.id,
      customer_email: email,
      customer_phone: phone,
      variables: {
        first_name: firstName,
        order_number: result.order_number,
        grand_total: (cartData.subtotal + shippingCost).toString()
      }
    })

    revalidatePath('/cart')
    revalidatePath('/account/orders')
    redirect(`/checkout/success/${result.order_number}`)
  }

  throw new Error('Failed to process checkout transaction. Result: ' + JSON.stringify(result))
}

export async function getOrderByNumber(orderNumber: string) {
  const { createAdminClient } = await import('@/utils/supabase/admin')
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:product_id (name, sku)
      )
    `)
    .eq('order_number', orderNumber)
    .single()

  if (error) {
    console.error('getOrderByNumber error:', error);
    return null;
  }
  return data
}
