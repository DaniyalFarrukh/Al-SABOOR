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
      className="add-to-cart-quick-btn"
    >
      {isAdding ? 'Adding...' : 'ADD TO CART'}
    </button>
  )
}
