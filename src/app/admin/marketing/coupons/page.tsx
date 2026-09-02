import { createClient } from '@/utils/supabase/server'
import { createCoupon, toggleCouponStatus } from '@/lib/actions/marketing'
import { Ticket, Plus } from 'lucide-react'

export default async function AdminCouponsPage() {
  const supabase = await createClient()
  const { data: coupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Ticket size={28} /> Discount Coupons
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        
        {/* List */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Code</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Discount</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Min Order</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--muted-foreground)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons?.map((coupon: any) => (
                <tr key={coupon.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '1.125rem' }}>{coupon.code}</td>
                  <td style={{ padding: '1rem' }}>
                    {coupon.discount_type === 'flat' ? `Rs. ${coupon.discount_value}` : `${coupon.discount_value}%`}
                    {coupon.max_discount && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Up to Rs. {coupon.max_discount}</div>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>{coupon.min_order_value ? `Rs. ${coupon.min_order_value}` : '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      backgroundColor: coupon.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: coupon.is_active ? '#22c55e' : '#ef4444'
                    }}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <form action={async () => {
                      'use server'
                      await toggleCouponStatus(coupon.id, coupon.is_active)
                    }}>
                      <button type="submit" className="btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!coupons || coupons.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    No coupons created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create Form */}
        <div className="admin-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Create Coupon
          </h2>
          <form action={async (formData) => {
            'use server'
            await createCoupon(formData)
          }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="form-group">
              <label className="form-label">Coupon Code</label>
              <input type="text" name="code" className="form-input" placeholder="e.g. SUMMER2026" required style={{ textTransform: 'uppercase' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select name="discount_type" className="form-input" required>
                <option value="flat">Flat Amount (Rs.)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Discount Value</label>
              <input type="number" name="discount_value" className="form-input" required min="1" step="0.01" />
            </div>

            <div className="form-group">
              <label className="form-label">Min Order Value (Optional)</label>
              <input type="number" name="min_order_value" className="form-input" min="0" step="0.01" />
            </div>

            <div className="form-group">
              <label className="form-label">Usage Limit (Optional)</label>
              <input type="number" name="usage_limit" className="form-input" min="1" placeholder="Total times code can be used" />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Create Coupon</button>
          </form>
        </div>

      </div>
    </div>
  )
}
