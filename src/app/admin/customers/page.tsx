import { getCustomers } from '@/lib/actions/customers'
import { Users, Search, Ban } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const customers = await getCustomers(params.q)

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={28} /> Customers
        </h1>
        
        <form style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', padding: '0.5rem 1rem' }}>
          <Search size={20} color="var(--muted-foreground)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            name="q" 
            placeholder="Search customers..." 
            defaultValue={params.q}
            style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '1rem', width: '250px' }} 
          />
        </form>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Contact</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Total Orders</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Total Spent</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--muted-foreground)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: any) => (
              <tr key={customer.id} style={{ borderBottom: '1px solid var(--border)', opacity: customer.is_blocked ? 0.6 : 1 }}>
                <td style={{ padding: '1rem', fontWeight: 600, fontSize: '1rem' }}>
                  {customer.first_name} {customer.last_name}
                  {customer.is_blocked && <Ban size={14} color="#ef4444" style={{ marginLeft: '0.5rem', display: 'inline' }} />}
                </td>
                <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>{customer.phone || 'N/A'}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{customer.orderCount}</td>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>Rs. {customer.totalSpent.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: customer.is_blocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: customer.is_blocked ? '#ef4444' : '#22c55e'
                  }}>
                    {customer.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link href={`/admin/customers/${customer.id}`}>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Profile</button>
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
