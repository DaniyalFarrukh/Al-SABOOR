import { createClient } from '@/utils/supabase/server'
import { processAdminReturn } from '@/lib/actions/returns'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, PackageCheck } from 'lucide-react'

export default async function AdminReturnDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: ret } = await supabase
    .from('returns')
    .select('*, orders(order_number, grand_total), return_items(*, order_items(product_id, quantity, unit_price, products(name, sku)))')
    .eq('id', resolvedParams.id)
    .single()

  if (!ret) redirect('/admin/returns')

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/returns" style={{ padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '4px', color: 'var(--foreground)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Return Request</h1>
        <span style={{ 
          padding: '0.25rem 0.5rem', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          fontWeight: 600,
          textTransform: 'uppercase',
          backgroundColor: 'var(--muted)',
          marginLeft: 'auto'
        }}>
          {ret.status}
        </span>
      </div>

      <div className="admin-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--muted-foreground)' }}>Order Number:</span>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
              <Link href={`/admin/orders/${ret.order_id}`} style={{ color: 'var(--primary)' }}>
                {ret.orders?.order_number}
              </Link>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--muted-foreground)' }}>Requested On:</span>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{new Date(ret.created_at).toLocaleString()}</div>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Customer Reason:</span>
            <div style={{ backgroundColor: 'var(--muted)', padding: '1rem', borderRadius: '4px', marginTop: '0.5rem', fontStyle: 'italic' }}>
              "{ret.reason}"
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Items to Return</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.5rem 0', textAlign: 'left', color: 'var(--muted-foreground)', fontWeight: 500 }}>Product</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'center', color: 'var(--muted-foreground)', fontWeight: 500 }}>Qty</th>
              <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--muted-foreground)', fontWeight: 500 }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {ret.return_items?.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 0' }}>
                  <div style={{ fontWeight: 600 }}>{item.order_items?.products?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>SKU: {item.order_items?.products?.sku}</div>
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600 }}>{item.quantity_returned}</td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600 }}>Rs. {(item.quantity_returned * item.order_items?.unit_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Admin Actions</h2>
        
        <form action={async (formData) => {
          'use server'
          const action = formData.get('action') as 'approve' | 'reject' | 'receive'
          const notes = formData.get('notes') as string
          await processAdminReturn(ret.id, action, notes)
        }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <textarea 
            name="notes" 
            className="form-input" 
            placeholder="Admin notes (Internal only)" 
            rows={3} 
            defaultValue={ret.admin_notes || ''}
          ></textarea>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {ret.status === 'requested' && (
              <>
                <button type="submit" name="action" value="approve" className="btn-primary" style={{ flex: 1, justifyContent: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> Approve Return
                </button>
                <button type="submit" name="action" value="reject" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' }}>
                  <XCircle size={18} /> Reject
                </button>
              </>
            )}

            {ret.status === 'approved' && (
              <button type="submit" name="action" value="receive" className="btn-primary" style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', backgroundColor: '#3b82f6' }}>
                <PackageCheck size={18} /> Mark as Received & Restore Stock
              </button>
            )}

            {ret.status === 'received' && (
              <div style={{ width: '100%', padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '4px', textAlign: 'center', fontWeight: 600 }}>
                Items Received & Stock Restored. Proceed to Refund from Order Details.
              </div>
            )}
          </div>

        </form>
      </div>

    </div>
  )
}
