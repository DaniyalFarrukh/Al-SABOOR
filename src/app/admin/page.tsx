import { Box, Plus, Package, Eye } from 'lucide-react'
import Link from 'next/link'
import { getAdminOrders } from '@/lib/actions/admin-orders'

export default async function AdminDashboardPage() {
  const orders = await getAdminOrders() || []
  
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length
  const completedOrders = orders.filter((o: any) => o.status === 'delivered').length
  const totalRevenue = orders
    .filter((o: any) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum: number, o: any) => sum + (Number(o.grand_total) || 0), 0)

  const recentOrders = orders.slice(0, 5)

  return (
    <div style={{ padding: '0 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Box size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>Orders</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Manage and track all customer orders</p>
          </div>
        </div>
        <Link href="/admin/orders/new" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Plus size={18} /> Create Manual Order
        </Link>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: '0.5rem' }}>Total Orders</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>{totalOrders}</h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>All time</p>
        </div>

        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: '0.5rem' }}>Pending Orders</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>{pendingOrders}</h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Awaiting fulfillment</p>
        </div>

        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: '0.5rem' }}>Completed Orders</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>{completedOrders}</h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Successfully delivered</p>
        </div>

        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', fontWeight: 500, marginBottom: '0.5rem' }}>Total Revenue</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>PKR {totalRevenue.toLocaleString()}</h2>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--info-bg)', color: 'var(--info-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>From valid orders</p>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="premium-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View All</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Order Number</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Total</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order: any) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, fontFamily: 'monospace' }}>{order.order_number}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{order.customer_first_name} {order.customer_last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{order.customer_email}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
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
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                  Rs. {order.grand_total.toLocaleString()}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '4px', color: 'var(--foreground)' }}>
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', width: '120px', height: '120px', backgroundColor: 'var(--danger-bg)', opacity: 0.5, borderRadius: '50%', zIndex: 0 }}></div>
                      <Package size={40} style={{ color: 'var(--primary)', position: 'relative', zIndex: 1 }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders found</h3>
                    <p style={{ color: 'var(--muted-foreground)' }}>When you receive orders, they will appear here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
