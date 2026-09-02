import { createAdminClient } from '@/utils/supabase/admin'
import ManualOrderForm from './ManualOrderForm'
import { Package } from 'lucide-react'

export default async function CreateManualOrderPage() {
  const supabase = createAdminClient()
  
  // Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Fetch active variants for those products
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, product_id, name, sku, price_override')
    .eq('is_active', true)

  // Fetch pricing for base products
  const { data: pricing } = await supabase
    .from('product_pricing')
    .select('product_id, retail_price, sale_price')

  // Stitch them together for the client component
  const productCatalog = products?.map(p => {
    const pPrice = pricing?.find(price => price.product_id === p.id)
    const pVariants = variants?.filter(v => v.product_id === p.id) || []
    
    return {
      ...p,
      price: pPrice?.sale_price || pPrice?.retail_price || 0,
      variants: pVariants.map(v => ({
        ...v,
        price: v.price_override || pPrice?.sale_price || pPrice?.retail_price || 0
      }))
    }
  }) || []

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Package size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Create Manual Order</h1>
      </div>
      
      <div className="admin-card" style={{ padding: '2rem' }}>
        <ManualOrderForm catalog={productCatalog} />
      </div>
    </div>
  )
}
