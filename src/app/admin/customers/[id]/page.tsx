import { getCustomerDetails, updateCustomerNotes, toggleCustomerBlock } from '@/lib/actions/customers'
import { User, Phone, Mail, Ban, CheckCircle, Save, ShoppingBag, MessageSquare } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AdminCustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { profile, orders, reviews } = await getCustomerDetails(params.id)

  if (!profile) notFound()

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={28} /> {profile.first_name} {profile.last_name}
        </h1>
        
        <form action={async () => {
          'use server'
          await toggleCustomerBlock(profile.id, profile.is_blocked)
        }}>
          <button type="submit" style={{ 
            padding: '0.75rem 1.5rem', 
            borderRadius: 'var(--radius)', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer',
            backgroundColor: profile.is_blocked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: profile.is_blocked ? '#22c55e' : '#ef4444',
            border: `1px solid ${profile.is_blocked ? '#22c55e' : '#ef4444'}`
          }}>
            {profile.is_blocked ? <CheckCircle size={18} /> : <Ban size={18} />}
            {profile.is_blocked ? 'Unblock Customer' : 'Block Customer'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Orders & Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} /> Order History
            </h2>
            {orders && orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order: any) => (
                  <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.order_number}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>Rs. {order.grand_total.toLocaleString()}</div>
                    <div>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--muted)' }}>{order.status}</span>
                    </div>
                    <Link href={`/admin/orders/${order.id}`}>
                      <button className="btn-secondary" style={{ padding: '0.5rem' }}>View Order</button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted-foreground)' }}>No orders placed by this customer.</p>
            )}
          </div>

          <div className="admin-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} /> Product Reviews
            </h2>
            {reviews && reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((review: any) => (
                  <div key={review.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{review.products?.name}</span>
                      <span style={{ color: '#eab308' }}>★ {review.rating}/5</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{review.comment}</p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: review.status === 'approved' ? '#22c55e' : '#ef4444' }}>
                      Status: {review.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted-foreground)' }}>No reviews submitted.</p>
            )}
          </div>

        </div>

        {/* Right Column: Details & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
          
          <div className="admin-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profile.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} color="var(--muted-foreground)" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {/* Note: Profiles in Phase 1 doesn't store email, it's in auth.users. But we have it in orders. */}
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                Customer since {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Internal Notes</h3>
            <form action={async (formData) => {
              'use server'
              await updateCustomerNotes(profile.id, formData.get('admin_notes') as string)
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea 
                name="admin_notes" 
                className="form-input" 
                rows={6} 
                placeholder="Add private notes about this customer..."
                defaultValue={profile.admin_notes || ''}
              ></textarea>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Notes
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  )
}
