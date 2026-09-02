'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
// No need for external uuid, we can use crypto.randomUUID() in Node 19+ / Web Crypto API

const GUEST_CART_COOKIE = 'guest_cart_id'

export async function getCart() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let cart = null
  let cartId = null
  let isRetailer = false

  if (user) {
    // Authenticated user cart
    const { data } = await supabase.from('carts').select('*').eq('user_id', user.id).eq('status', 'active').maybeSingle()
    if (data) {
      cart = data
      cartId = data.id
    }
    
    // Check if user is a Retailer
    const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', user.id).single()
    if (profile?.role_id) {
      const { data: role } = await supabase.from('roles').select('name').eq('id', profile.role_id).single()
      if (role?.name === 'Retailer') isRetailer = true
    }
  } else {
    // Guest cart
    const cookieStore = await cookies()
    const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value
    
    if (guestCartId) {
      const { data } = await supabase.from('carts').select('*').eq('id', guestCartId).eq('status', 'active').is('user_id', null).maybeSingle()
      if (data) {
        cart = data
        cartId = data.id
      }
    }
  }

  if (!cartId) return null

  // Fetch cart items with dynamically fetched prices
  const { data: items } = await supabase
    .from('cart_items')
    .select(`
      id, quantity, product_id, variant_id,
      products (name, slug, product_images(image_url, is_primary), product_pricing(retail_price, sale_price, retailer_price))
    `)
    .eq('cart_id', cartId)
    .order('created_at', { ascending: true })

  if (!items) return null

  // Calculate totals based on LIVE database pricing
  let subtotal = 0
  
  const processedItems = items.map((item: any) => {
    const pricing = item.products?.product_pricing?.[0] || item.products?.product_pricing || {}
    let price = pricing.sale_price || pricing.retail_price || 0
    if (isRetailer && pricing.retailer_price) {
      price = pricing.retailer_price
    }
    const itemTotal = price * item.quantity
    subtotal += itemTotal
    
    return {
      ...item,
      price,
      itemTotal
    }
  })

  return {
    cart,
    items: processedItems,
    subtotal,
    itemCount: processedItems.reduce((acc, item) => acc + item.quantity, 0)
  }
}

async function getOrCreateCartId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: existing } = await supabase.from('carts').select('id').eq('user_id', user.id).eq('status', 'active').maybeSingle()
    if (existing) return existing.id
    
    const { data: newCart, error } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single()
    if (error) throw error
    return newCart.id
  } else {
    const cookieStore = await cookies()
    const existingGuestId = cookieStore.get(GUEST_CART_COOKIE)?.value
    
    if (existingGuestId) {
      const { data: existing } = await supabase.from('carts').select('id').eq('id', existingGuestId).eq('status', 'active').maybeSingle()
      if (existing) return existing.id
    }
    
    const newGuestId = crypto.randomUUID()
    const { error } = await supabase.from('carts').insert({ id: newGuestId }).select('id').single()
    if (error) throw error
    
    cookieStore.set(GUEST_CART_COOKIE, newGuestId, { maxAge: 60 * 60 * 24 * 30, httpOnly: true }) // 30 days
    return newGuestId
  }
}

export async function addToCart(productId: string, variantId: string | null = null, quantity: number = 1) {
  const supabase = await createClient()
  const cartId = await getOrCreateCartId()

  // We must use admin client here because public RLS might block inventory reads
  const adminClient = createAdminClient()
  const { data: inventory } = await adminClient
    .from('inventory')
    .select('quantity')
    .eq('product_id', productId)
    .is('variant_id', variantId || null)
    .maybeSingle()

  if (!inventory || inventory.quantity < quantity) {
    return { error: 'Insufficient stock available.' }
  }

  // Check if item exists in cart already
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .is('variant_id', variantId || null)
    .maybeSingle()

  if (existingItem) {
    await supabase.from('cart_items').update({ quantity: existingItem.quantity + quantity }).eq('id', existingItem.id)
  } else {
    await supabase.from('cart_items').insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId || undefined,
      quantity
    })
  }

  revalidatePath('/cart')
  revalidatePath('/', 'layout')
}

export async function updateCartQuantity(itemId: string, newQuantity: number) {
  const supabase = await createClient()
  if (newQuantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', itemId)
  } else {
    await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId)
  }
  revalidatePath('/cart')
  revalidatePath('/', 'layout')
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient()
  await supabase.from('cart_items').delete().eq('id', itemId)
  revalidatePath('/cart')
  revalidatePath('/', 'layout')
}

// Called after successful login to merge guest cart into user cart
export async function mergeCartOnLogin() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value
  
  if (!guestCartId) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get guest cart items
  const { data: guestItems } = await supabase.from('cart_items').select('*').eq('cart_id', guestCartId)
  
  if (guestItems && guestItems.length > 0) {
    // Get or create user cart
    const { data: userCart } = await supabase.from('carts').select('id').eq('user_id', user.id).eq('status', 'active').maybeSingle()
    
    let targetCartId = userCart?.id
    if (!targetCartId) {
      const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single()
      targetCartId = newCart?.id
    }

    if (targetCartId) {
      // For each guest item, either add or update quantity
      for (const item of guestItems) {
        const { data: existingUserItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', targetCartId)
          .eq('product_id', item.product_id)
          .is('variant_id', item.variant_id || null)
          .maybeSingle()

        if (existingUserItem) {
          await supabase.from('cart_items').update({ quantity: existingUserItem.quantity + item.quantity }).eq('id', existingUserItem.id)
        } else {
          await supabase.from('cart_items').insert({
            cart_id: targetCartId,
            product_id: item.product_id,
            variant_id: item.variant_id || undefined,
            quantity: item.quantity
          })
        }
      }
    }
  }

  // Delete the old guest cart and clear cookie
  await supabase.from('carts').delete().eq('id', guestCartId)
  cookieStore.delete(GUEST_CART_COOKIE)
}
