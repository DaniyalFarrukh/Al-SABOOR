import { getProductBySlug } from '@/lib/actions/storefront'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CheckCircle2, XCircle, ChevronRight, MessageCircle, Star, User, ShoppingCart } from 'lucide-react'
import { submitReview } from '@/lib/actions/reviews'
import { getStoreSettings } from '@/lib/actions/settings'
import { getUser } from '@/lib/actions/auth'
import AddToCartActions from './AddToCartActions'
import StarRatingInput from '@/components/StarRatingInput'
export const dynamic = 'force-dynamic'

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params
  const { data: product, error } = await getProductBySlug(params.slug)
  
  if (error || !product) {
    return { title: 'Product Not Found' }
  }

  const title = product.meta_title || product.name
  const description = product.meta_description || product.description || `Buy ${product.name} at Al Saboor Autos.`
  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url || product.product_images?.[0]?.image_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: primaryImage ? [{ url: primaryImage }] : [],
      type: 'article',
    },
    alternates: {
      canonical: `/product/${product.slug}`
    }
  }
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const { data: product, error } = await getProductBySlug(params.slug)
  const user = await getUser()
  const isWholesaler = user?.profile?.roles?.name === 'Retailer' || user?.profile?.roles?.name === 'Wholesaler'

  if (error || !product) {
    notFound()
  }

  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url 
    || '/placeholder.png';

  const pricing = product.product_pricing?.[0] || product.product_pricing || {};
  const retailPrice = pricing.retail_price || 0;
  const salePrice = pricing.sale_price;
  const retailerPrice = pricing.retailer_price;

  const inventoryItem = Array.isArray(product.inventory) ? product.inventory[0] : product.inventory;
  const stockQty = inventoryItem?.quantity || 0;
  const inStock = stockQty > 0;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const settings = await getStoreSettings()
  
  // JSON-LD Structured Data
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: primaryImage ? [primaryImage] : [],
    description: product.meta_description || product.description || `Buy ${product.name}`,
    sku: product.sku,
    brand: product.brands?.name ? { '@type': 'Brand', name: product.brands.name } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'PKR',
      price: salePrice || retailPrice,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: settings?.general?.store_name || 'Al Saboor Autos'
      }
    }
  }

  const approvedReviews = product.reviews?.filter((r: any) => r.status === 'approved') || []
  if (approvedReviews.length > 0) {
    const avgRating = approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / approvedReviews.length
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: approvedReviews.length
    }
  }

  return (
    <div className="storefront-container" style={{ padding: '2rem 1rem 6rem 1rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted-foreground)' }}>Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" style={{ textDecoration: 'none', color: 'var(--muted-foreground)' }}>Products</Link>
        {product.categories?.name && (
          <>
            <ChevronRight size={14} />
            <Link href={`/category/${product.categories.slug}`} style={{ textDecoration: 'none', color: 'var(--muted-foreground)' }}>
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{product.name}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
        
        {/* Images */}
        <div>
          <div style={{ backgroundColor: 'var(--muted)', padding: '1.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1/1', position: 'relative', marginBottom: '1rem' }}>
            <Image 
              src={primaryImage} 
              alt={product.name} 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
          {product.product_images && product.product_images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {product.product_images.map((img: any, idx: number) => (
                <div key={img.id || idx} style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative', borderRadius: '4px', overflow: 'hidden', border: img.image_url === primaryImage ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                  <Image 
                    src={img.image_url} 
                    alt={`${product.name} photo ${idx + 1}`}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: '#1a1b1c' }}>{product.name}</h1>
          
          {isWholesaler && retailerPrice ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary)', display: 'block', fontSize: '0.875rem' }}>Wholesale Price:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1b1c' }}>Rs{retailerPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1b1c' }}>Rs{(salePrice || retailPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              {salePrice && (
                <span style={{ fontSize: '1rem', color: '#ef4444', textDecoration: 'line-through' }}>
                  Rs{retailPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span>Availability:</span> 
              <span style={{ color: '#1a1b1c' }}>{inStock ? 'In stock' : 'Out of stock'}</span>
            </div>
            {product.categories?.name && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span>Product type:</span> 
                <span style={{ color: '#1a1b1c' }}>{product.categories.name}</span>
              </div>
            )}
          </div>

          {product.product_variants && product.product_variants.length > 0 && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Available Options:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {product.product_variants.map((variant: any) => (
                  <div key={variant.id} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: 600 }}>{variant.name}</div>
                    {variant.price_override && <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>Rs{variant.price_override.toLocaleString()}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <AddToCartActions productId={product.id} inStock={inStock} price={isWholesaler && retailerPrice ? retailerPrice : (salePrice || retailPrice)} />
          
          <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            <p>SKU: {product.sku}</p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
        <h2 className="section-title">Specifications</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="admin-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Technical Specs</h3>
            {product.product_specifications?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {product.product_specifications.map((spec: any) => (
                  <li key={spec.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>{spec.spec_key}</span>
                    <span style={{ fontWeight: 500 }}>{spec.spec_value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--muted-foreground)' }}>No specifications available.</p>
            )}
          </div>


        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem', marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Customer Reviews</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
            <Star size={24} fill="#eab308" color="#eab308" />
            {product.reviews && product.reviews.length > 0 
              ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
              : '0.0'} 
            <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 400 }}>
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Write Review Form */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Write a Review</h3>
            <form action={async (formData) => {
              'use server'
              const rating = parseInt(formData.get('rating') as string)
              const title = formData.get('title') as string
              const comment = formData.get('comment') as string
              await submitReview(product.id, rating, comment, title)
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Rating</label>
                <StarRatingInput />
              </div>
              <div className="form-group">
                <label className="form-label">Review Title (Optional)</label>
                <input type="text" name="title" className="form-input" placeholder="Summarize your experience" />
              </div>
              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea name="comment" className="form-input" rows={4} placeholder="What did you like or dislike?" required></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Submit Review</button>
            </form>
          </div>

          {/* Review List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {product.reviews?.filter((r: any) => r.status === 'approved').map((review: any) => (
              <div key={review.id} style={{ padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="var(--muted-foreground)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{review.profiles?.first_name} {review.profiles?.last_name}</div>
                      {review.is_verified && (
                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Verified Purchase
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.125rem', color: '#eab308' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                    ))}
                  </div>
                </div>
                {review.title && <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{review.title}</h4>}
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: 1.6 }}>{review.comment}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '1rem' }}>
                  Posted on {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {(!product.reviews || product.reviews.length === 0) && (
              <p style={{ color: 'var(--muted-foreground)' }}>No reviews yet. Be the first to review this product!</p>
            )}
          </div>
          
        </div>
      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="mobile-sticky-cart">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700 }}>Rs. {(salePrice || retailPrice).toLocaleString()}</div>
        </div>
        <button className="btn-primary" disabled={!inStock} style={{ padding: '0.5rem 1rem' }}>
          <ShoppingCart size={16} /> Add
        </button>
      </div>

    </div>
  )
}
