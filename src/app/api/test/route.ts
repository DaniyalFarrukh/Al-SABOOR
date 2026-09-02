import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  
  // get a product ID
  const { data: product } = await supabase.from('products').select('id').limit(1).single()
  
  if (!product) return NextResponse.json({ error: 'No product found' })

  const { data, error } = await supabase.rpc('adjust_stock', {
    p_product_id: product.id,
    p_variant_id: null,
    p_quantity_change: 5,
    p_reason: 'manual_adjustment',
    p_reference_id: null
  })
  
  return NextResponse.json({ success: true, data, error })
}
