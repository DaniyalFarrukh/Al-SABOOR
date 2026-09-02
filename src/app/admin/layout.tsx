'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Package, Tags, Settings, Upload, LogOut, Layers,
  Users, ShoppingCart, Shield, BarChart3, Ticket, ArrowRight
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [permissions, setPermissions] = useState<string[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/permissions')
      .then(res => res.json())
      .then(data => setPermissions(data.permissions || []))
  }, [])

  const hasPerm = (p: string) => true // TEMPORARILY BYPASSED FOR LOCAL DEV: permissions.includes('superadmin') || permissions.includes(p)

  const allLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'view_orders' },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, perm: 'view_orders' },
    { href: '/admin/products', label: 'Products', icon: Package, perm: 'view_products' },
    { href: '/admin/inventory', label: 'Inventory', icon: Layers, perm: 'manage_inventory' },
    { href: '/admin/categories', label: 'Categories', icon: Tags, perm: 'view_products' },
    { href: '/admin/brands', label: 'Brands', icon: Settings, perm: 'view_products' },
    { href: '/admin/customers', label: 'Customers', icon: Users, perm: 'view_customers' },
    { href: '/admin/wholesalers', label: 'Wholesalers', icon: Users, perm: 'view_customers' },
    { href: '/admin/wholesalers/orders', label: 'Wholesale Orders', icon: Package, perm: 'view_orders' },
    { href: '/admin/retailers', label: 'Wholesaler Apps', icon: Users, perm: 'view_customers' },
    { href: '/admin/marketing/coupons', label: 'Coupons', icon: Ticket, perm: 'manage_marketing' },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, perm: 'view_analytics' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield, perm: 'manage_admins' },
    { href: '/admin/settings', label: 'Settings', icon: Settings, perm: 'manage_settings' },
  ]

  const links = allLinks.filter(link => hasPerm(link.perm))

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <style>{`
        .admin-layout { flex-direction: row; }
        .admin-sidebar { width: 280px; flex-shrink: 0; transition: transform 0.3s ease; }
        .admin-main { padding: 2rem; overflow-y: auto; width: 100%; flex: 1; }
        .mobile-header { display: none; }
        .overlay { display: none; }
        
        @media (max-width: 768px) {
          .admin-layout { flex-direction: column; }
          .admin-sidebar { 
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 1000; 
            transform: translateX(-100%); 
            width: 280px; 
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { padding: 1rem; }
          .mobile-header { 
            display: flex; align-items: center; justify-content: space-between; 
            padding: 1rem; border-bottom: 1px solid var(--border); background: var(--card-bg);
          }
          .overlay.open { 
            display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; 
          }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="mobile-header">
        <Link href="/admin" style={{ fontSize: '1.5rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.02em', color: 'var(--foreground)', textDecoration: 'none' }}>
          <span style={{ color: 'var(--primary)' }}>AL</span>&nbsp;SABOOR
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} style={{ padding: '0.5rem', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--foreground)' }}>
          <Layers size={24} />
        </button>
      </div>

      {/* Overlay for mobile drawer */}
      <div className={`overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ borderRight: '1px solid var(--border)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-bg)' }}>
        <div style={{ marginBottom: '3rem' }}>
          <Link href="/admin" style={{ fontSize: '1.5rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', color: 'var(--foreground)' }}>
            <span style={{ color: 'var(--primary)' }}>AL</span>&nbsp;SABOOR
          </Link>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{ padding: '0.875rem 1rem' }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
