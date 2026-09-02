import Link from 'next/link'
import { ArrowRight, Truck, ShieldCheck, CreditCard, Headset, Wind, Lightbulb, HardHat, CircleDashed, Battery, Package, Link2, Cog } from 'lucide-react'
import { getHomepageData } from '@/lib/actions/storefront'
import ProductCard from '@/components/ProductCard'
import ProductRowCarousel from '@/components/ProductRowCarousel'
import HeroSlider from '@/components/HeroSlider'
import { getUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { featured, flashSales, categories, latestProducts } = await getHomepageData()
  const user = await getUser()
  const isWholesaler = user?.profile?.roles?.name === 'Retailer' || user?.profile?.roles?.name === 'Wholesaler'


  return (
    <div>
      
      {/* ══════════════════════════════════════
          HERO — Wide Image Banner
      ══════════════════════════════════════ */}
      <HeroSlider />

      {/* ══════════════════════════════════════
          CATEGORY CAROUSEL — Box Style
      ══════════════════════════════════════ */}
      <style>{`
        .box-category-card {
          border: 1px solid var(--border);
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .box-category-card:hover {
          border-color: var(--border);
          border-bottom: 2px solid #ca8a04;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}</style>
      <div style={{ background: '#fcfcfc', padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--md)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Browse by Category</p>
              <h2 style={{ fontWeight: 800, fontSize: '28px', color: 'var(--dk)', margin: 0 }}>
                Shop <span style={{ color: '#ca8a04', fontWeight: 600 }}>What You Need</span>
              </h2>
            </div>
            <Link href="/products" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dk)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Shop All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
            gap: '12px',
            width: '100%'
          }}>
            {categories.slice(0, 12).map((cat: any) => {
              return (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="photo-category-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '12px',
                  textDecoration: 'none',
                  padding: '8px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--muted)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '2px solid transparent',
                    transition: 'border-color 0.2s ease'
                  }}>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'var(--muted-foreground)', fontSize: '10px', textTransform: 'uppercase', textAlign: 'center', padding: '0 4px' }}>Photo</span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', textAlign: 'center' }}>
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
                whiteSpace: 'nowrap',
                flexShrink: 0,
                borderRight: '1px solid var(--border)',
                textDecoration: 'none',
              }}>
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          PROMOTIONAL BANNERS
      ══════════════════════════════════════ */}
      <div style={{ background: 'var(--bg)', padding: '20px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px' }}>
          {/* Banner 1 */}
          <div style={{ 
            position: 'relative', 
            borderRadius: 'var(--radius)', 
            overflow: 'hidden', 
            minHeight: '220px', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: '#000' 
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("/bike-care-products.png")',
              backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7, zIndex: 0,
            }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '30px', color: '#fff' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Premium Bike Care</h3>
              <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9 }}>Keep your motorcycle shining like new.</p>
              <Link href="/products" style={{ display: 'inline-block', borderBottom: '2px solid var(--accent)', color: '#fff', fontWeight: 600, textTransform: 'uppercase', fontSize: '12px', paddingBottom: '2px' }}>Shop Now</Link>
            </div>
          </div>
          
          {/* Banner 2 */}
          <div style={{ 
            position: 'relative', 
            borderRadius: 'var(--radius)', 
            overflow: 'hidden', 
            minHeight: '220px', 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: '#000' 
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?q=80&w=800&auto=format&fit=crop")',
              backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7, zIndex: 0,
            }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '30px', color: '#fff' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>New LED Lights</h3>
              <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9 }}>Upgrade your visibility on the road.</p>
              <Link href="/products" style={{ display: 'inline-block', borderBottom: '2px solid var(--accent)', color: '#fff', fontWeight: 600, textTransform: 'uppercase', fontSize: '12px', paddingBottom: '2px' }}>Shop Now</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CURATED PRODUCTS CAROUSEL
      ══════════════════════════════════════ */}
      {latestProducts.length > 0 && (
        <div style={{ background: 'var(--bg)', padding: '30px 0 50px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
            
            {/* Centered Section Header with Lines */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '20px',
                fontWeight: 800, 
                fontSize: '18px', 
                color: 'var(--dk)', 
                margin: '0 0 10px 0', 
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                <span style={{ height: '2px', backgroundColor: '#e5e5e5', flex: 1, maxWidth: '150px' }}></span>
                BIKE ACCESSORIES
                <span style={{ height: '2px', backgroundColor: '#e5e5e5', flex: 1, maxWidth: '150px' }}></span>
              </h2>
              <Link href="/products" style={{ fontSize: '13px', color: '#666', borderBottom: '1px solid #666', paddingBottom: '1px', textDecoration: 'none', transition: 'color 0.2s' }}>
                View All
              </Link>
            </div>

            {/* Horizontal Grid / Carousel with Navigation Arrows */}
            <ProductRowCarousel products={latestProducts} isWholesaler={isWholesaler} />

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TRUST / VALUE PROPS (Chaudhry Style)
      ══════════════════════════════════════ */}
      <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
          {[
            { icon: <Truck size={24} />, title: 'Nationwide Delivery', sub: 'Fast & Secure Shipping' },
            { icon: <ShieldCheck size={24} />, title: 'Genuine Products', sub: '100% Authentic Parts' },
            { icon: <CreditCard size={24} />, title: 'Secure Payment', sub: 'Cash on Delivery Available' },
            { icon: <Headset size={24} />, title: '24/7 Support', sub: 'Dedicated Customer Care' }
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              minWidth: '240px',
              flex: 1
            }}>
              <div style={{
                width: '48px', height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--danger-bg)', 
                color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px'
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--dk)', margin: 0, marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--md)', margin: 0 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
