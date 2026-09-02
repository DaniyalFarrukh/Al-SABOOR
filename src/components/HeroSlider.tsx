'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { preload } from 'react-dom'

const IMAGES = [
  'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/2528118/pexels-photo-2528118.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=1200'
]

export default function HeroSlider() {
  preload(IMAGES[0], { as: 'image' })
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }} className="hero-container">
      <style>{`
        @media (max-width: 768px) {
          .hero-container { padding: 8px !important; }
          .hero-content { 
            padding: 40px 20px !important; 
            text-align: center !important; 
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .hero-content h1 { font-size: 2.2rem !important; line-height: 1.1 !important; text-align: center !important; }
          .hero-content p { font-size: 1rem !important; margin-bottom: 24px !important; text-align: center !important; }
          .hero-nav { left: 20px !important; right: 20px !important; bottom: 16px !important; justify-content: center !important; }
        }
      `}</style>
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#000',
      }}>
        {/* Background Images */}
        {IMAGES.map((src, idx) => (
          <div
            key={src}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${src}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentIndex === idx ? 0.6 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: 0,
            }}
          />
        ))}

        {/* Content Overlay */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 1, padding: '40px 60px', maxWidth: '600px', color: '#fff' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '4px 12px', 
            backgroundColor: 'var(--accent)', 
            color: 'var(--accent-fg)',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            Hot Deals
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Buy Bike & Accessories
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '32px', lineHeight: 1.6 }}>
            Top quality automobile parts and the latest gadgets available online in Pakistan. Cash on delivery.
          </p>
          <Link href="/products" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-fg)',
            padding: '12px 28px',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'background-color 0.2s'
          }}>
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>

        {/* Navigation Progress Bars */}
        <div className="hero-nav" style={{ position: 'absolute', bottom: '24px', left: '60px', right: '60px', display: 'flex', gap: '8px', zIndex: 1 }}>
          {IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '2px'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div style={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0,
                backgroundColor: 'var(--accent)',
                width: currentIndex === idx ? '100%' : (idx < currentIndex ? '100%' : '0%'),
                transition: currentIndex === idx ? 'width 5s linear' : 'none'
              }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
