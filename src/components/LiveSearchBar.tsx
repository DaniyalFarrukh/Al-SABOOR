'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Loader2 } from 'lucide-react'
import { searchProducts } from '@/lib/actions/storefront'

export default function LiveSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        const res = await searchProducts({ q: query, page: 1 })
        setResults(res.data || [])
        setIsOpen(true)
        setIsLoading(false)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsOpen(false)
      router.push(`/products?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div ref={wrapperRef} style={{ flex: 1, width: '100%', maxWidth: '100%', position: 'relative', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder="Search for exhausts, LEDs, helmets, gloves..."
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            backgroundColor: '#1f1f1f',
            border: '1px solid #333',
            borderRadius: '6px 0 0 6px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.875rem',
            color: '#f1f5f9',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <button type="submit" aria-label="Search" className="search-submit-btn" style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-fg)',
          border: 'none',
          padding: '0.65rem 1.1rem',
          borderRadius: '0 6px 6px 0',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontFamily: 'inherit',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
        }}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} 
          <span className="search-btn-text">Search</span>
        </button>
      </form>

      {/* Dropdown Results */}
      {isOpen && query.length >= 2 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid var(--border)',
          zIndex: 100,
          maxHeight: '400px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {isLoading && results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--md)', fontSize: '14px' }}>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              {results.slice(0, 8).map((product) => {
                const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
                                  || product.product_images?.[0]?.image_url
                                  || '/placeholder.svg'
                const pricing = product.product_pricing?.[0]
                const currentPrice = pricing?.sale_price || pricing?.retail_price || 0

                return (
                  <Link
                    key={product.id}
                    href={`/product/${encodeURIComponent(product.slug)}`}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <div style={{ width: '40px', height: '40px', position: 'relative', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--muted)', flexShrink: 0 }}>
                      <Image 
                        src={primaryImage} 
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dk)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                        Rs. {currentPrice.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                )
              })}
              
              <Link
                href={`/products?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  backgroundColor: 'var(--danger-bg)',
                  textDecoration: 'none'
                }}
              >
                View all results for "{query}"
              </Link>
            </>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--md)', fontSize: '14px' }}>
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
