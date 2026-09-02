import { getAdminOrders } from '@/lib/actions/admin-orders'
import Link from 'next/link'
import { Package, Eye } from 'lucide-react'

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders('customer')

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Package size={28} /> Orders
        </h1>
        <Link href="/admin/orders/new" className="btn-primary">
          Create Manual Order
        </Link>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Order Number</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--muted-foreground)' }}>Total</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--muted-foreground)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500, fontFamily: 'monospace' }}>{order.order_number}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{order.customer_first_name} {order.customer_last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{order.customer_email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{order.customer_phone}</div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' : 'var(--muted)',
                    color: order.status === 'delivered' ? '#22c55e' : 'var(--foreground)'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                  Rs. {order.grand_total.toLocaleString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '4px' }}>
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
