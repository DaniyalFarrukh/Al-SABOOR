'use client'

import React, { useState } from 'react'
import { addToCart } from '@/lib/actions/cart'
import { useRouter } from 'next/navigation'

import { useCartDrawer } from '@/providers/CartDrawerProvider'

export default function AddToCartQuick({ productId }: { productId: string }) {
  const [isAdding, setIsAdding] = useState(false)
  const { openDrawer } = useCartDrawer()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent Link navigation
    e.stopPropagation() // prevent bubbling

    setIsAdding(true)
    const result = await addToCart(productId, null, 1)
    setIsAdding(false)
    if (!result?.error) {
      openDrawer()
    } else {
      alert(result.error)
    }
  }

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      style={{
        marginTop: '10px',
        width: '100%',
        backgroundColor: 'transparent',
        color: '#1a1b1c',
        border: '1.5px solid #1a1b1c',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: 700,
        cursor: isAdding ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        textAlign: 'center',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        transition: 'opacity 0.15s, background-color 0.15s, transform 0.15s',
        opacity: isAdding ? 0.7 : 1
      }}
    >
      {isAdding ? 'Adding...' : 'ADD TO CART'}
    </button>
  )
}
