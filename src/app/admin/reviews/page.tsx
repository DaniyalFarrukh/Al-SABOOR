import { getAdminReviews, moderateReview } from '@/lib/actions/reviews'
import { MessageSquare, Star, CheckCircle, XCircle, Trash2 } from 'lucide-react'

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews()

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare size={28} /> Product Reviews
        </h1>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {reviews.map((review: any) => (
          <div key={review.id} className="admin-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{review.products?.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                    by {review.profiles?.first_name} {review.profiles?.last_name} 
                    {review.is_verified && <span style={{ color: '#22c55e', marginLeft: '0.5rem', fontWeight: 600 }}>✓ Verified Purchase</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', color: '#eab308' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                  ))}
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', backgroundColor: 'var(--muted)', padding: '1rem', borderRadius: '4px' }}>
                {review.title && <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{review.title}</h4>}
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: 1.5 }}>{review.comment || 'No written comment.'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                Status: <strong style={{ textTransform: 'uppercase', color: review.status === 'approved' ? '#22c55e' : review.status === 'rejected' ? '#ef4444' : 'var(--foreground)' }}>{review.status}</strong>
              </div>

              <form action={async (formData) => {
                'use server'
                const action = formData.get('action') as 'approve' | 'reject' | 'delete'
                await moderateReview(review.id, action)
              }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                
                {review.status !== 'approved' && (
                  <button type="submit" name="action" value="approve" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem' }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                )}

                {review.status !== 'rejected' && (
                  <button type="submit" name="action" value="reject" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem' }}>
                    <XCircle size={14} /> Reject
                  </button>
                )}

                <button type="submit" name="action" value="delete" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}>
                  <Trash2 size={14} /> Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
            No reviews submitted yet.
          </div>
        )}
      </div>
    </div>
  )
}
