'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

interface ProductRowCarouselProps {
  products: any[]
  isWholesaler?: boolean
}

export default function ProductRowCarousel({ products, isWholesaler }: ProductRowCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 10)
    // small tolerance for subpixel rendering
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)

    // Re-check after images might have loaded
    const timeout = setTimeout(checkScroll, 300)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
      clearTimeout(timeout)
    }
  }, [checkScroll, products])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 280 // average card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <style>{`
        .product-carousel-row {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .product-carousel-row::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .carousel-nav-btn {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 1px solid var(--border);
          color: var(--dk);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .carousel-nav-btn:hover:not(:disabled) {
          background-color: #ffffff;
          border-color: var(--accent);
          color: var(--accent-hover);
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
        }
        .carousel-nav-btn:active:not(:disabled) {
          transform: translateY(-50%) scale(0.96);
        }
        .carousel-nav-btn:disabled {
          opacity: 0;
          pointer-events: none;
          cursor: default;
        }
        @media (max-width: 768px) {
          .carousel-nav-btn {
            width: 36px;
            height: 36px;
          }
          .carousel-nav-prev {
            left: -6px !important;
          }
          .carousel-nav-next {
            right: -6px !important;
          }
        }
      `}</style>

      {/* Left (Previous) Arrow */}
      <button
        type="button"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        aria-label="Previous products"
        className="carousel-nav-btn carousel-nav-prev"
        style={{
          left: '-16px',
        }}
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>

      {/* Horizontal Carousel Row */}
      <div
        ref={scrollRef}
        className="product-carousel-row"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '20px',
          overflowX: 'auto',
          padding: '4px 2px 16px 2px',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((product: any) => (
          <div
            key={product.id}
            style={{
              minWidth: '240px',
              maxWidth: '280px',
              flex: '0 0 auto',
              scrollSnapAlign: 'start',
              display: 'flex',
            }}
          >
            <ProductCard product={product} isWholesaler={isWholesaler} />
          </div>
        ))}
      </div>

      {/* Right (Next) Arrow */}
      <button
        type="button"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        aria-label="Next products"
        className="carousel-nav-btn carousel-nav-next"
        style={{
          right: '-16px',
        }}
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}
