import { getUser } from '@/lib/actions/auth'

export default async function AccountOverviewPage() {
  const user = await getUser()

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        Profile Overview
      </h2>

      <div className="two-col-form" style={{ gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--muted-foreground)' }}>Personal Information</h3>
          
          <div className="form-group">
            <label className="form-label">First Name</label>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
              {user?.profile?.first_name || 'Not provided'}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
              {user?.profile?.last_name || 'Not provided'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
              {user?.email}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
              {user?.profile?.phone || 'Not provided'}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--muted-foreground)' }}>Account Security</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
            To update your password, please sign out and use the "Forgot Password" link on the login page.
          </p>
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Account Created</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              {new Date(user?.created_at || '').toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
