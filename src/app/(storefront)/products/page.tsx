import { searchProducts } from '@/lib/actions/storefront'
import { getCategories } from '@/lib/actions/categories'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { Filter, ChevronUp } from 'lucide-react'
import type { Metadata } from 'next'
import { getUser } from '@/lib/actions/auth'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata(props: { searchParams: Promise<{ [key: string]: string | undefined }> }): Promise<Metadata> {
  const searchParams = await props.searchParams
  const category = searchParams.category
  
  if (category) {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('name, meta_title, meta_description').eq('slug', category).single()
    if (data) {
      const title = data.meta_title || `${data.name} | Motorcycle Parts`
      return {
        title,
        description: data.meta_description || `Browse our selection of ${data.name}.`,
        alternates: {
          canonical: `/products?category=${category}`
        }
      }
    }
  }

  return {
    title: 'All Products | Al Saboor Autos',
    description: 'Browse our full catalog of motorcycle parts, exhausts, LEDs, and accessories.',
    alternates: {
      canonical: `/products`
    }
  }
}

export default async function CatalogPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const categories = await getCategories()
  const user = await getUser()
  const isWholesaler = user?.profile?.roles?.name === 'Retailer' || user?.profile?.roles?.name === 'Wholesaler'
  
  const { data: products, count, totalPages } = await searchProducts({
    q: searchParams.q,
    category: searchParams.category,
    brand: searchParams.brand,
    sort: searchParams.sort,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    page: searchParams.page ? parseInt(searchParams.page) : 1
  })

  return (
    <div className="storefront-container" style={{ padding: '2rem 1rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {searchParams.q ? `Search: "${searchParams.q}"` : searchParams.category ? `Category: ${searchParams.category}` : 'All Products'}
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>{count} products found</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Sidebar Filters (Desktop) */}
        <aside style={{ width: '260px', minWidth: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column' }} className="hide-mobile">
          <div className="custom-scrollbar" style={{ position: 'sticky', top: '6rem', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxHeight: 'calc(100vh - 8rem)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem', margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <Filter size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} /> Filters
              </h3>
              {(searchParams.sort || searchParams.category) && (
                <Link href="/products" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 'auto' }}>Clear All</Link>
              )}
            </div>
            
            <style>{`
              .filter-link {
                display: flex;
                align-items: center;
                padding: 0.6rem 0;
                color: #333;
                text-decoration: none;
                font-size: 0.95rem;
                transition: color 0.2s;
              }
              .filter-link:hover {
                color: #000;
              }
              .filter-link.active {
                color: #000;
                font-weight: 700;
              }
              .category-details summary::-webkit-details-marker {
                display: none;
              }
              .category-details summary {
                list-style: none;
                user-select: none;
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: var(--border);
                border-radius: 10px;
              }
              .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                background: #ccc;
              }
            `}</style>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.5px' }}>Sort By</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
                <li><Link href="?sort=newest" className={`filter-link ${searchParams.sort === 'newest' ? 'active' : ''}`}>Newest Arrivals</Link></li>
                <li><Link href="?sort=price_asc" className={`filter-link ${searchParams.sort === 'price_asc' ? 'active' : ''}`}>Price: Low to High</Link></li>
                <li><Link href="?sort=price_desc" className={`filter-link ${searchParams.sort === 'price_desc' ? 'active' : ''}`}>Price: High to Low</Link></li>
              </ul>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #666', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: 0, letterSpacing: '0.5px' }}>CATEGORIES</h4>
                <ChevronUp size={18} color="#666" />
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0', fontSize: '0.9rem' }}>
                <li>
                  <Link href="/products" className={`filter-link ${!searchParams.category ? 'active' : ''}`}>
                    Home
                  </Link>
                </li>
                {categories?.filter(c => c.is_active && !c.parent_id).map(parent => {
                  const children = categories?.filter(c => c.is_active && c.parent_id === parent.id) || [];
                  const hasChildren = children.length > 0;
                  const isParentActive = searchParams.category === parent.slug;
                  const isChildActive = children.some(c => c.slug === searchParams.category);
                  const isOpen = isParentActive || isChildActive;

                  if (!hasChildren) {
                    return (
                      <li key={parent.id}>
                        <Link href={`?category=${parent.slug}`} className={`filter-link ${isParentActive ? 'active' : ''}`}>
                          {parent.name}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={parent.id}>
                      <details open={isOpen} className="category-details">
                        <summary className={`filter-link ${isParentActive ? 'active' : ''}`} style={{ cursor: 'pointer', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                          <Link href={`?category=${parent.slug}`} style={{ color: 'inherit', textDecoration: 'none', flex: 1 }}>
                            {parent.name}
                          </Link>
                          <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#000', padding: '0 4px', lineHeight: 1 }}>
                            {isOpen ? '−' : '+'}
                          </span>
                        </summary>
                        <ul style={{ listStyle: 'none', padding: '0.25rem 0 0.5rem 1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '1px solid var(--border)', marginLeft: '1rem', marginTop: '0.25rem' }}>
                          {children.map(child => (
                            <li key={child.id}>
                              <Link href={`?category=${child.slug}`} className={`filter-link ${searchParams.category === child.slug ? 'active' : ''}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </div>
            
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1rem' }}>No products found.</p>
              <Link href="/products" className="btn-primary">View All Products</Link>
            </div>
          ) : (
            <div className="product-grid" style={{ marginBottom: 0 }}>
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} isWholesaler={isWholesaler} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
