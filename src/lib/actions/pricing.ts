'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getWholesaleTiers(productId: string, variantId?: string) {
  const supabase = await createClient()
  
  let query = supabase.from('wholesale_pricing_tiers').select('*').eq('product_id', productId)
  
  if (variantId) {
    query = query.eq('variant_id', variantId)
  } else {
    query = query.is('variant_id', null)
  }

  const { data, error } = await query.order('min_quantity', { ascending: true })
  
  if (error) throw error
  return data
}

export async function saveWholesaleTier(productId: string, variantId: string | null, minQuantity: number, price: number) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('wholesale_pricing_tiers').insert({
    product_id: productId,
    variant_id: variantId || null,
    min_quantity: minQuantity,
    price: price
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteWholesaleTier(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('wholesale_pricing_tiers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}
