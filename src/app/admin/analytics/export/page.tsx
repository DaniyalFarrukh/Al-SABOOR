import { Download, FileText, Package, Users, ShoppingBag } from 'lucide-react'
import { hasPermission } from '@/lib/actions/analytics'
import { AlertCircle } from 'lucide-react'

export default async function AdminExportPage() {
  const canExport = await hasPermission('export_data')
  const canViewRevenue = await hasPermission('view_revenue')

  if (!canExport) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>You do not have permission to export data from the platform.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Download size={28} /> Data Exports
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
          Download platform data in CSV format for external analysis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Orders Export */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius)', color: '#3b82f6' }}>
              <ShoppingBag size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Orders</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', flex: 1 }}>
            Export all order data including statuses, shipping addresses, and customer details.
          </p>
          <a href="/api/admin/export/orders" download>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
              <Download size={16} /> Download CSV
            </button>
          </a>
        </div>

        {/* Sales Export */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: canViewRevenue ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius)', color: '#10b981' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Financial Sales</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', flex: 1 }}>
            Export detailed financial breakdowns (Gross, Discounts, Refunds, Net).
          </p>
          {canViewRevenue ? (
            <a href="/api/admin/export/sales" download>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
                <Download size={16} /> Download CSV
              </button>
            </a>
          ) : (
            <button className="btn-primary" disabled style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
              Requires Revenue Permission
            </button>
          )}
        </div>

        {/* Inventory Export */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius)', color: '#f59e0b' }}>
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Inventory</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', flex: 1 }}>
            Export current stock levels, low stock thresholds, and SKUs.
          </p>
          <a href="/api/admin/export/inventory" download>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
              <Download size={16} /> Download CSV
            </button>
          </a>
        </div>

        {/* Customers Export */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius)', color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Customers</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', flex: 1 }}>
            Export customer profiles, contact info, and lifetime value.
          </p>
          <a href="/api/admin/export/customers" download>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
              <Download size={16} /> Download CSV
            </button>
          </a>
        </div>

      </div>
    </div>
  )
}
