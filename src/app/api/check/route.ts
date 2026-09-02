import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const productId = 'f4355a6c-7d62-4466-bc83-7ea4838ca6f4'
  
  const { data: invData } = await supabase.from('inventory').select('*').eq('product_id', productId)
  const { data: variantData } = await supabase.from('product_variants').select('*').eq('product_id', productId)
  const { data: cartItems } = await supabase.from('cart_items').select('*').eq('product_id', productId)

  // Force fix inventory
  if (!invData || invData.length === 0) {
    await supabase.from('inventory').insert({ product_id: productId, quantity: 100 })
  } else {
    for (const inv of invData) {
      if (inv.quantity < 10) {
        await supabase.from('inventory').update({ quantity: 100 }).eq('id', inv.id)
      }
    }
    // Also if the product has variants, check if variant stock exists
    if (variantData && variantData.length > 0) {
      for (const variant of variantData) {
        const hasInv = invData.find(i => i.variant_id === variant.id)
        if (!hasInv) {
          await supabase.from('inventory').insert({ product_id: productId, variant_id: variant.id, quantity: 100 })
        }
      }
    }
  }
  
  return NextResponse.json({ success: true, invData, variantData, cartItems })
}
