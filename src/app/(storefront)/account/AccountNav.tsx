'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, MapPin, Heart } from 'lucide-react'

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Link href="/account" className={`sidebar-link ${pathname === '/account' ? 'active' : ''}`}>
        <User size={18} /> Profile Overview
      </Link>
      <Link href="/account/orders" className={`sidebar-link ${pathname?.startsWith('/account/orders') ? 'active' : ''}`}>
        <Package size={18} /> Order History
      </Link>
      <Link href="/account/addresses" className={`sidebar-link ${pathname?.startsWith('/account/addresses') ? 'active' : ''}`}>
        <MapPin size={18} /> Saved Addresses
      </Link>
      <Link href="/account/wishlist" className={`sidebar-link ${pathname?.startsWith('/account/wishlist') ? 'active' : ''}`}>
        <Heart size={18} /> Wishlist
      </Link>
    </nav>
  )
}
