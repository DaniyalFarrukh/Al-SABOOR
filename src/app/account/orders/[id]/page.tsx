import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCcw, Package } from 'lucide-react'
import { requestReturn } from '@/lib/actions/returns'

export default async function CustomerOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, sku)), order_history(*), shipments(*), returns(*)')
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .single()

  if (!order) redirect('/account')

  const existingReturn = order.returns && order.returns.length > 0 ? order.returns[0] : null
  const isDelivered = order.status === 'delivered'

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/account" style={{ padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '4px', color: 'var(--foreground)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>{order.order_number}</h1>
        <span style={{ 
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 600,
          textTransform: 'uppercase',
          backgroundColor: 'var(--muted)',
          marginLeft: 'auto'
        }}>
          {order.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Items</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.5rem 0', textAlign: 'left', color: 'var(--muted-foreground)', fontWeight: 500 }}>Product</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'center', color: 'var(--muted-foreground)', fontWeight: 500 }}>Qty</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--muted-foreground)', fontWeight: 500 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ fontWeight: 600 }}>{item.products?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>SKU: {item.products?.sku}</div>
                    </td>
                    <td style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600 }}>Rs. {item.total_price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Request Return Section */}
          {isDelivered && !existingReturn && (
            <div className="admin-card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCcw size={20} /> Request a Return
              </h2>
              <form action={async (formData) => {
                'use server'
                const reason = formData.get('reason') as string
                // In a full implementation, you'd allow selecting specific items to return. 
                // For this phase, we map all items for the return request payload.
                const returnPayload = order.order_items.map((item: any) => ({
                  orderItemId: item.id,
                  quantity: item.quantity
                }))
                await requestReturn(order.id, reason, returnPayload)
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Why are you returning this order?</label>
                  <textarea name="reason" className="form-input" rows={3} required placeholder="Please provide details..." />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Return Request</button>
              </form>
            </div>
          )}

          {existingReturn && (
            <div className="admin-card" style={{ padding: '2rem', border: '1px solid var(--border)', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                <RefreshCcw size={20} /> Return Status: <span style={{ textTransform: 'uppercase' }}>{existingReturn.status}</span>
              </h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Your return request was submitted on {new Date(existingReturn.created_at).toLocaleDateString()}. Our team will review it shortly.</p>
            </div>
          )}

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} /> Shipments
            </h3>
            {order.shipments && order.shipments.length > 0 ? order.shipments.map((s: any) => (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600 }}>{s.courier_name}</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>Tracking: {s.tracking_number}</span>
                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>{s.status}</span>
              </div>
            )) : (
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Pending dispatch.</p>
            )}
          </div>

          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <span>Shipping</span>
              <span>Rs. {order.shipping_cost.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>Rs. {order.grand_total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
