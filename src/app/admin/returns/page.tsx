import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { RefreshCcw, Eye } from 'lucide-react'

export default async function AdminReturnsPage() {
  const supabase = await createClient()
  const { data: returns } = await supabase
    .from('returns')
    .select('*, orders(order_number, customer_first_name, customer_last_name)')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCcw size={28} /> Returns & Refunds
        </h1>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Return ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Order</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--muted-foreground)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns?.map((ret: any) => (
              <tr key={ret.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500, fontFamily: 'monospace', fontSize: '0.875rem' }}>{ret.id.split('-')[0]}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>
                  <Link href={`/admin/orders/${ret.order_id}`} style={{ color: 'var(--primary)' }}>
                    {ret.orders?.order_number}
                  </Link>
                </td>
                <td style={{ padding: '1rem' }}>
                  {ret.orders?.customer_first_name} {ret.orders?.customer_last_name}
                </td>
                <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>
                  {new Date(ret.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: ret.status === 'refunded' ? 'rgba(34, 197, 94, 0.1)' : 'var(--muted)',
                    color: ret.status === 'refunded' ? '#22c55e' : 'var(--foreground)'
                  }}>
                    {ret.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <Link href={`/admin/returns/${ret.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '4px' }}>
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            {(!returns || returns.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  No returns found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
