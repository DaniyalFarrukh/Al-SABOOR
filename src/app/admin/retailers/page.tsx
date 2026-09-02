import { getRetailers } from '@/lib/actions/customers'
import Link from 'next/link'
import { Store, User, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react'
import ApprovalToggle from './ApprovalToggle'

export default async function AdminRetailersPage() {
  const retailers = await getRetailers()

  return (
    <div className="admin-card">
      <div className="admin-header">
        <h1 className="admin-title">Retailer Applications</h1>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Business Name / Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Application Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {retailers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
                  No retailer applications found.
                </td>
              </tr>
            ) : (
              retailers.map((retailer: any) => (
                <tr key={retailer.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
                        <Store size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{retailer.first_name} {retailer.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                      <Mail size={14} />
                      {retailer.auth_users?.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                      <Phone size={14} />
                      {retailer.phone || 'N/A'}
                    </div>
                  </td>
                  <td>
                    {new Date(retailer.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {retailer.is_approved ? (
                      <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Approved
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>
                        Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <ApprovalToggle id={retailer.id} currentStatus={retailer.is_approved} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
