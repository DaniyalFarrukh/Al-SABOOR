import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AddToCartQuick from './AddToCartQuick'

export default function ProductCard({ product, isWholesaler }: { product: any, isWholesaler?: boolean }) {
  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url 
    || '/placeholder.png';
  
  const pricing = product.product_pricing?.[0] || product.product_pricing || {};
  const retailPrice = pricing.retail_price || 0;
  const salePrice = pricing.sale_price;
  const retailerPrice = pricing.retailer_price;
  const isFlashSale = pricing.is_flash_sale;
  
  const displayPrice = isWholesaler && retailerPrice ? retailerPrice : (salePrice || retailPrice);
  const hasDiscount = !isWholesaler && salePrice && salePrice < retailPrice;
  const discountPct = hasDiscount ? Math.round((1 - salePrice / retailPrice) * 100) : 0;

  return (
    <Link
      href={`/product/${encodeURIComponent(product.slug)}`}
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
        transition: 'border-color .25s, box-shadow .25s, transform .25s',
        boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      {/* Sale / New Badge */}
      {(isFlashSale || hasDiscount) && (
        <span style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          backgroundColor: 'var(--accent)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: '4px',
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
        }}>
          {isFlashSale ? 'Flash Sale' : `Sale! -${discountPct}%`}
        </span>
      )}
      {!isFlashSale && !hasDiscount && (
        <span style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          backgroundColor: '#1a1b1c',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: '4px',
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
        }}>
          New
        </span>
      )}

      {/* Product Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: '#f8f8f8', overflow: 'hidden', padding: '8px' }}>
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 250px"
          style={{ objectFit: 'contain', padding: '8px' }}
        />
      </div>

      {/* Product Info */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>


        <h3 style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#1a1b1c',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
          flex: 1,
        }}>
          {product.name}
        </h3>



        {/* Price Row */}
        <div style={{ marginTop: '6px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#1a1b1c' }}>
            Rs {displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through', marginLeft: '6px' }}>
              Rs {retailPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <AddToCartQuick productId={product.id} />
      </div>
    </Link>
  )
}
