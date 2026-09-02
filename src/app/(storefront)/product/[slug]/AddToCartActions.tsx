'use client'

import React, { useState } from 'react'
import { addToCart } from '@/lib/actions/cart'
import { useRouter } from 'next/navigation'
import { Share2 } from 'lucide-react'
import { useCartDrawer } from '@/providers/CartDrawerProvider'

export default function AddToCartActions({ productId, inStock, price }: { productId: string, inStock: boolean, price: number }) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()
  const { openDrawer } = useCartDrawer()

  const increment = () => setQuantity(prev => prev + 1)
  const decrement = () => setQuantity(prev => Math.max(1, prev - 1))

  const subtotal = price * quantity

  const handleAddToCart = async () => {
    if (!inStock) return
    setIsAdding(true)
    const result = await addToCart(productId, null, quantity)
    setIsAdding(false)
    if (!result?.error) {
      openDrawer()
    } else {
      alert(result.error)
    }
  }

  const handleBuyItNow = async () => {
    if (!inStock) return
    setIsAdding(true)
    const result = await addToCart(productId, null, quantity)
    setIsAdding(false)
    if (!result?.error) {
      router.push('/checkout')
    } else {
      alert(result.error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#1a1b1c', marginBottom: '0.5rem' }}>
        Subtotal: <strong>Rs{(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>

      {/* Quantity Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Quantity:</span>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', height: '40px' }}>
          <button 
            onClick={decrement}
            style={{ width: '40px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--muted-foreground)' }}
          >-</button>
          <div style={{ width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            {quantity}
          </div>
          <button 
            onClick={increment}
            style={{ width: '40px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--muted-foreground)' }}
          >+</button>
        </div>
      </div>

      {/* Add To Cart & Share */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          style={{ 
            flex: 1, 
            backgroundColor: '#1a1b1c', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '1rem', 
            fontSize: '0.875rem', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            cursor: inStock ? 'pointer' : 'not-allowed',
            opacity: inStock ? (isAdding ? 0.7 : 1) : 0.5
          }}
        >
          {isAdding ? 'Adding...' : 'ADD TO CART'}
        </button>
        <button 
          onClick={handleShare}
          style={{ width: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Share2 size={20} color="var(--muted-foreground)" />
        </button>
      </div>

      {/* Buy It Now */}
      <button 
        onClick={handleBuyItNow}
        disabled={!inStock || isAdding}
        style={{ 
          width: '100%', 
          backgroundColor: 'transparent', 
          color: '#1a1b1c', 
          border: '1px solid #1a1b1c', 
          borderRadius: '4px', 
          padding: '1rem', 
          fontSize: '0.875rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          cursor: inStock ? 'pointer' : 'not-allowed',
          opacity: inStock ? (isAdding ? 0.7 : 1) : 0.5
        }}
      >
        BUY IT NOW
      </button>

    </div>
  )
}
