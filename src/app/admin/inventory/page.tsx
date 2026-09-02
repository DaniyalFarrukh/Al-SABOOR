import { getInventoryItems } from '@/lib/actions/inventory'
import Link from 'next/link'
import { AlertTriangle, PackageX } from 'lucide-react'

export default async function AdminInventoryPage() {
  const inventory = await getInventoryItems()

  // Process data for dashboard
  const lowStockThreshold = 5
  const lowStockItems = inventory?.filter((item: any) => item.quantity > 0 && item.quantity <= (item.low_stock_threshold || lowStockThreshold)) || []
  const outOfStockItems = inventory?.filter((item: any) => item.quantity === 0) || []
  
  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Inventory Dashboard</h1>
        <Link href="/admin/inventory/history" className="btn-secondary">
          View Movement History
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Low Stock Alerts */}
        <div className="admin-card" style={{ borderLeft: '4px solid #eab308' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#854d0e', fontSize: '1.25rem', marginBottom: '1rem' }}>
            <AlertTriangle size={20} /> Low Stock Alerts
          </h2>
          {lowStockItems.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)' }}>No items are currently low on stock.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStockItems.map((item: any) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.products?.name} {item.product_variants ? ` - ${item.product_variants.name}` : ''}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>SKU: {item.product_variants?.sku || item.products?.sku}</div>
                  </div>
                  <div style={{ color: '#854d0e', fontWeight: 600 }}>{item.quantity} left</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Out of Stock Alerts */}
        <div className="admin-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontSize: '1.25rem', marginBottom: '1rem' }}>
            <PackageX size={20} /> Out of Stock
          </h2>
          {outOfStockItems.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)' }}>All items are currently in stock.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {outOfStockItems.map((item: any) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.products?.name} {item.product_variants ? ` - ${item.product_variants.name}` : ''}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>SKU: {item.product_variants?.sku || item.products?.sku}</div>
                  </div>
                  <div style={{ color: '#991b1b', fontWeight: 600 }}>Out of Stock</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Inventory</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Stock Level</th>
                <th>Threshold</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory?.map((item: any) => (
                <tr key={item.id}>
                  <td><code>{item.product_variants?.sku || item.products?.sku}</code></td>
                  <td style={{ fontWeight: 500 }}>{item.products?.name} {item.product_variants ? ` - ${item.product_variants.name}` : ''}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.875rem', 
                      fontWeight: 600,
                      backgroundColor: item.quantity === 0 ? '#fef2f2' : (item.quantity <= (item.low_stock_threshold || lowStockThreshold) ? '#fefce8' : '#f0fdf4'),
                      color: item.quantity === 0 ? '#991b1b' : (item.quantity <= (item.low_stock_threshold || lowStockThreshold) ? '#854d0e' : '#166534'),
                    }}>
                      {item.quantity}
                    </span>
                  </td>
                  <td>{item.low_stock_threshold || lowStockThreshold}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/inventory/adjust?product_id=${item.product_id}&variant_id=${item.variant_id || ''}`} className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                      Adjust Stock
                    </Link>
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
