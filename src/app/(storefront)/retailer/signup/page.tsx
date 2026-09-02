'use client'

import { signupRetailer } from '@/lib/actions/auth'
import Link from 'next/link'
import { useActionState } from 'react'

export default function RetailerSignupPage() {
  const [state, action, isPending] = useActionState(signupRetailer, null)

  return (
    <div className="storefront-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '2rem 1rem' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Retailer Application</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Create a B2B wholesale account to access retailer pricing</p>
        </div>

        {state?.error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>
            {state.error}
          </div>
        )}

        <form action={action}>
          <div className="two-col-form" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">First Name</label>
              <input type="text" id="first_name" name="first_name" className="form-input" required />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="last_name">Last Name</label>
              <input type="text" id="last_name" name="last_name" className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number (Business)</label>
            <input type="tel" id="phone" name="phone" className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Business Email</label>
            <input type="email" id="email" name="email" className="form-input" required />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className="form-input" required />
          </div>

          <button type="submit" className="btn-primary" disabled={isPending} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', marginTop: '1rem', opacity: isPending ? 0.7 : 1 }}>
            {isPending ? 'Submitting Application...' : 'Apply for Retailer Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
          Already have a Retailer account? <Link href="/retailer/login" style={{ color: 'var(--foreground)', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
