'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getInventoryItems() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (name, sku, out_of_stock_behavior),
      product_variants (name, sku)
    `)
    .order('quantity', { ascending: true })
    
  if (error) throw error
  return data
}

export async function getLowStockAlerts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (name, sku),
      product_variants (name, sku)
    `)
    .lte('quantity', 5) // We can use low_stock_threshold if available, but for simple querying, let's just get <= 5 or handle in JS. 
    // Wait, let's just fetch all and filter in JS if low_stock_threshold varies, or use a Postgres view. 
    // To be safe, we fetch everything with quantity <= 10 for alerts, then filter on the frontend.
    .lte('quantity', 10)
    .order('quantity', { ascending: true })
    
  if (error) throw error
  return data
}

export async function adjustStock(
  productId: string, 
  variantId: string | null, 
  quantityChange: number, 
  reason: string,
  referenceId: string | null = null
) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase.rpc('adjust_stock', {
    p_product_id: productId,
    p_variant_id: variantId || null,
    p_quantity_change: quantityChange,
    p_reason: reason,
    p_reference_id: referenceId || null
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/inventory')
  return { success: true, data }
}

export async function getStockMovements() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      *,
      inventory (
        products (name),
        product_variants (name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data
}
