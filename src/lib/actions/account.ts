'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// -----------------------------------------------------------------------------
// Wishlist Actions
// -----------------------------------------------------------------------------

export async function toggleWishlist(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to save items to your wishlist.' }
  }

  // Check if exists
  const { data: existing } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    // Remove
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId)
  } else {
    // Add
    await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId })
  }

  revalidatePath('/product/[slug]', 'page')
  revalidatePath('/account/wishlist', 'page')
  return { success: true, isWishlisted: !existing }
}

export async function getWishlist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('wishlists')
    .select(`
      product_id,
      products (name, slug, product_images(image_url, is_primary), product_pricing(retail_price, sale_price))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

// -----------------------------------------------------------------------------
// Address Actions
// -----------------------------------------------------------------------------

export async function getAddresses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  return data || []
}

export async function addAddress(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const addressData = {
    user_id: user.id,
    address_type: (formData.get('address_type') as any) || 'both',
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone: formData.get('phone') as string,
    address_line1: formData.get('address_line1') as string,
    address_line2: formData.get('address_line2') as string || null,
    city: formData.get('city') as string,
    state: formData.get('state') as string || null,
    postal_code: formData.get('postal_code') as string,
    is_default: formData.get('is_default') === 'on',
  }

  // If this is set to default, unset others
  if (addressData.is_default) {
    await supabase.from('customer_addresses').update({ is_default: false }).eq('user_id', user.id)
  }

  const { error } = await supabase.from('customer_addresses').insert(addressData)
  if (error) return { error: error.message }

  revalidatePath('/account/addresses')
  return { success: true, timestamp: Date.now() } // timestamp helps form reset
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('customer_addresses').delete().eq('id', addressId)
  if (error) return { error: error.message }
  revalidatePath('/account/addresses')
  return { success: true }
}
