import { adjustStock } from '@/lib/actions/inventory'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StockAdjustmentPage(props: { searchParams: Promise<{ product_id: string, variant_id?: string }> }) {
  const searchParams = await props.searchParams
  const productId = searchParams.product_id
  const variantId = searchParams.variant_id

  if (!productId) {
    redirect('/admin/inventory')
  }

  async function action(formData: FormData) {
    'use server'
    const qtyChange = parseInt(formData.get('quantity_change') as string)
    const reason = formData.get('reason') as string

    if (isNaN(qtyChange)) return

    const res = await adjustStock(productId, variantId || null, qtyChange, reason)
    
    if (res?.error) {
      throw new Error(JSON.stringify(res.error, null, 2))
    }
    
    redirect('/admin/inventory')
  }

  return (
    <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="admin-header">
        <h1 className="admin-title">Adjust Stock</h1>
      </div>
      
      <form action={action}>
        <div className="form-group">
          <label className="form-label">Product ID</label>
          <input type="text" className="form-input" value={productId} disabled />
        </div>
        
        {variantId && (
          <div className="form-group">
            <label className="form-label">Variant ID</label>
            <input type="text" className="form-input" value={variantId} disabled />
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="quantity_change">Quantity Change (Use negative numbers to reduce stock)</label>
          <input type="number" id="quantity_change" name="quantity_change" className="form-input" required placeholder="e.g. 5 or -2" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reason">Reason for Adjustment</label>
          <select id="reason" name="reason" className="form-input" required>
            <option value="">Select a reason...</option>
            <option value="manual_adjustment">Manual Adjustment</option>
            <option value="restock">Restock / Purchase Received</option>
            <option value="damage">Damaged Goods</option>
            <option value="return">Customer Return</option>
            <option value="correction">Inventory Count Correction</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary">Confirm Adjustment</button>
          <Link href="/admin/inventory" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
