'use client'

import { login } from '@/lib/actions/auth'
import Link from 'next/link'
import { useActionState } from 'react'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null)

  return (
    <div className="storefront-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '2rem 1rem' }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Sign in to your account to continue</p>
        </div>

        {state?.error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>
            {state.error}
          </div>
        )}

        <form action={action}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input type="email" id="email" name="email" className="form-input" required />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Forgot password?</Link>
            </div>
            <input type="password" id="password" name="password" className="form-input" required />
          </div>

          <button type="submit" className="btn-primary" disabled={isPending} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', marginTop: '1rem', opacity: isPending ? 0.7 : 1 }}>
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--foreground)', fontWeight: 500 }}>Sign up</Link>
        </div>
      </div>
    </div>
  )
}
