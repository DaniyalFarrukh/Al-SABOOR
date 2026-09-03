'use client'

import { loginAdmin } from '@/lib/actions/admin-auth'
import { useActionState } from 'react'

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(loginAdmin, null)

  return (
    <div className="storefront-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem 1rem' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Access</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Please enter the admin password</p>
        </div>

        {state?.error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>
            {state.error}
          </div>
        )}

        <form action={action}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form-input" 
              required 
              autoFocus 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isPending} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', marginTop: '1rem', opacity: isPending ? 0.7 : 1 }}>
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
