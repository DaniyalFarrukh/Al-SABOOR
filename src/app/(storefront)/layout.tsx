import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, User, Menu, Bike, Phone, Mail, CheckCircle, Truck, Wrench, ShieldCheck, CreditCard } from 'lucide-react'
import { getCart } from '@/lib/actions/cart'
import { getUser } from '@/lib/actions/auth'
import { getStoreSettings } from '@/lib/actions/settings'
import { getCategories } from '@/lib/actions/categories'

import { getHomepageData } from '@/lib/actions/storefront'
import { CartDrawerProvider } from '@/providers/CartDrawerProvider'
import CartDrawer from '@/components/CartDrawer'
import HeaderCartButton from '@/components/HeaderCartButton'
import LiveSearchBar from '@/components/LiveSearchBar'
import CategoryNav from '@/components/CategoryNav'

export const dynamic = 'force-dynamic'

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const cartData = await getCart()
  const user = await getUser()
  const settings = await getStoreSettings()
  const categories = await getCategories()
  const storefrontData = await getHomepageData()
  
  const cartItemCount = cartData?.itemCount || 0
  const storeName = settings?.general?.store_name || 'AL SABOOR AUTOS'

  return (
    <CartDrawerProvider>
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
        <CartDrawer cartData={cartData} suggestedProducts={storefrontData?.featured || []} />
      <header style={{ backgroundColor: 'var(--header-bg)', position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Top utility bar */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '6px 0' }}>
          <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
              <Link href="/about" style={{ color: 'rgba(255,255,255,0.55)' }}>About</Link>
              <Link href="/contact" style={{ color: 'rgba(255,255,255,0.55)' }}>Contact</Link>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={12} /> {settings?.general?.contact_number || '0300-0000000'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={12} /> {settings?.general?.email || 'info@alsaboor.pk'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Category Navigation Bar (Interactive with mobile support) ── */}
        <CategoryNav categories={categories || []} />

        {/* Main header row (Search Bar, Logo, Icons) */}
        <style>{`
          .main-header-row {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            min-height: 80px;
            padding: 10px 20px;
          }
          .search-bar-wrapper {
            flex: 1;
            min-width: 0;
            width: 100%;
          }
          .logo-img {
            max-height: 76px;
          }
          @media (max-width: 768px) {
            .main-header-row {
              flex-wrap: nowrap;
              gap: 0.6rem;
              padding: 0.6rem 0.75rem !important;
              min-height: auto;
            }
            .search-bar-wrapper {
              flex: 1;
              min-width: 0;
              margin-top: 0;
            }
            .logo-img {
              max-height: 40px !important;
            }
            .search-btn-text,
            .cart-btn-text,
            .account-link-text {
              display: none;
            }
            .header-cart-btn {
              padding: 0.45rem 0.6rem !important;
              gap: 0 !important;
            }
            .search-submit-btn {
              padding: 0.5rem 0.75rem !important;
            }
          }
        `}</style>
        <div className="main-header-row" style={{ maxWidth: '1340px', margin: '0 auto', padding: '1rem 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
            <img
              src="/logo_wb.png"
              alt="AL SABOOR Traders"
              className="logo-img"
              style={{ objectFit: 'contain', width: 'auto' }}
            />
          </Link>

          {/* Search Bar */}
          <div className="search-bar-wrapper">
            <LiveSearchBar />
          </div>

          {/* Right Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {(user?.profile?.roles?.name === 'Retailer' || user?.profile?.roles?.name === 'Wholesaler') && (
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                <CheckCircle size={12} style={{ marginRight: '4px' }} /> Wholesaler
              </div>
            )}
            <Link href={user ? "/account" : "/login"} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}>
              <User size={22} style={{ color: 'var(--accent)' }} />
              <span className="account-link-text">Account</span>
            </Link>
            <HeaderCartButton cartItemCount={cartItemCount} />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#111', color: 'rgba(255,255,255,0.5)', marginTop: '3rem' }}>
        <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '3rem 20px 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <Image src="/logo_wb.png" alt="AL SABOOR Traders" width={120} height={48} style={{ objectFit: 'contain' }} />
            </Link>
            <p style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: '1rem' }}>Pakistan's premium motorcycle parts and accessories. Trusted by 50,000+ riders nationwide.</p>
            {settings?.general?.contact_number && <p style={{ fontSize: '13px' }}>📞 {settings.general.contact_number}</p>}
            {settings?.general?.email && <p style={{ fontSize: '13px' }}>✉️ {settings.general.email}</p>}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Shop</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '13px' }}>
              {['All Products', 'Exhausts', 'LED & Lighting', 'Helmets', 'Accessories', 'Tires'].map(item => (
                <li key={item}><Link href="/products" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Policies</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '13px' }}>
              {[['Shipping Policy', '/policies/shipping-policy'], ['Return Policy', '/policies/return-policy'], ['Privacy Policy', '/policies/privacy-policy'], ['Terms of Service', '/policies/terms-of-service']].map(([label, href]) => (
                <li key={href}><Link href={href} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Why AL SABOOR?</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px' }}>
              {[
                { icon: <CheckCircle size={14} />, text: '100% Genuine Parts' },
                { icon: <Truck size={14} />, text: '24–48h Delivery' },
                { icon: <Wrench size={14} />, text: 'Expert Support Team' },
                { icon: <ShieldCheck size={14} />, text: 'Official Warranty' },
                { icon: <CreditCard size={14} />, text: 'Flexible Payments' }
              ].map(item => (
                <li key={item.text} style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1f1f1f', padding: '1.5rem 20px', textAlign: 'center', fontSize: '12px', maxWidth: '1340px', margin: '0 auto' }}>
          © {new Date().getFullYear()} {storeName}. All rights reserved. | Pakistan's #1 Motorcycle Parts Platform
        </div>
      </footer>

        {/* Floating WhatsApp Button */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
          <a href="https://wa.me/923218405029" target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              backgroundColor: '#25D366',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              color: '#fff',
              textDecoration: 'none'
            }}
          >
            {/* WhatsApp Icon */}
                        {/* WhatsApp Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
            </svg>
          </a>
        </div>

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hide-mobile { display: flex; }
        @media (max-width: 768px) { .hide-mobile { display: none; } }
      `}</style>
      </div>
    </CartDrawerProvider>
  )
}
