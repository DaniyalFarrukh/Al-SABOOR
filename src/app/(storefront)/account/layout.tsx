import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser, logout } from '@/lib/actions/auth'
import { LogOut } from 'lucide-react'
import { AccountNav } from './AccountNav'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="storefront-container" style={{ padding: '2rem 1rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>My Account</h1>

      <div className="responsive-grid account-grid">
        
        {/* Account Sidebar */}
        <aside className="admin-card" style={{ height: 'fit-content' }}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{user.profile?.first_name} {user.profile?.last_name}</p>
              {(user.profile?.roles?.name === 'Retailer' || user.profile?.roles?.name === 'Wholesaler') && (
                <span style={{ backgroundColor: 'var(--primary, #f59e0b)', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                  Wholesaler
                </span>
              )}
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{user.email}</p>
          </div>
          
          <AccountNav />
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <form action={logout}>
              <button type="submit" className="sidebar-link" style={{ width: '100%', color: '#ef4444' }}>
                <LogOut size={18} /> Sign Out
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="admin-card">
          {children}
        </div>
      </div>
    </div>
  )
}
