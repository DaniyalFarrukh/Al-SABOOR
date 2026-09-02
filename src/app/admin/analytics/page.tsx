import { getDashboardStats, getProductPerformance } from '@/lib/actions/analytics'
import { BarChart3, TrendingUp, DollarSign, Users, Package, AlertCircle } from 'lucide-react'

export default async function AdminAnalyticsDashboard() {
  const { data: stats, error } = await getDashboardStats()
  const { data: products } = await getProductPerformance()

  if (error) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={28} /> Analytics & Reporting
        </h1>
        <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Last 30 Days</span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Net Revenue</span>
            <DollarSign size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>Rs. {stats?.net_revenue.toLocaleString()}</div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Total Orders</span>
            <Package size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.total_orders.toLocaleString()}</div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Avg Order Value</span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>Rs. {Math.round(stats?.average_order_value || 0).toLocaleString()}</div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--muted-foreground)' }}>Active Customers</span>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.total_customers.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Revenue Breakdown */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Revenue Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <span>Gross Sales (Subtotal)</span>
              <span style={{ fontWeight: 500 }}>Rs. {stats?.gross_revenue.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', color: '#ef4444' }}>
              <span>Discounts Applied</span>
              <span style={{ fontWeight: 500 }}>- Rs. {stats?.total_discounts.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', color: '#ef4444' }}>
              <span>Refunds Processed</span>
              <span style={{ fontWeight: 500 }}>- Rs. {stats?.total_refunds.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <span>Shipping Collected</span>
              <span style={{ fontWeight: 500 }}>+ Rs. {stats?.total_shipping.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontSize: '1.125rem', fontWeight: 700 }}>
              <span>Net Revenue</span>
              <span>Rs. {stats?.net_revenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Best Selling Products</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Product Name</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--muted-foreground)' }}>Units Sold</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--muted-foreground)' }}>Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {products?.slice(0, 10).map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{product.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{product.unitsSold}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                    Rs. {product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
