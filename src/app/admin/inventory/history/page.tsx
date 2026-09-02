import { getStockMovements } from '@/lib/actions/inventory'
import Link from 'next/link'

export default async function StockMovementHistoryPage() {
  const movements = await getStockMovements()

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Stock Movement History</h1>
        <Link href="/admin/inventory" className="btn-secondary">
          Back to Inventory
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Reason</th>
                <th style={{ textAlign: 'right' }}>Change</th>
              </tr>
            </thead>
            <tbody>
              {movements?.map((movement: any) => {
                const isPositive = movement.quantity_change > 0
                return (
                  <tr key={movement.id}>
                    <td style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {movement.inventory?.products?.name} 
                      {movement.inventory?.product_variants ? ` - ${movement.inventory.product_variants.name}` : ''}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{movement.reason.replace('_', ' ')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ 
                        color: isPositive ? '#166534' : '#991b1b',
                        fontWeight: 600,
                        backgroundColor: isPositive ? '#f0fdf4' : '#fef2f2',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        {isPositive ? '+' : ''}{movement.quantity_change}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {(!movements || movements.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
