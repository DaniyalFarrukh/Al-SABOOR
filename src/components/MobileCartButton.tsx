'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartDrawer } from '@/providers/CartDrawerProvider'

export default function MobileCartButton({ cartItemCount }: { cartItemCount: number }) {
  const { openDrawer } = useCartDrawer()

  return (
    <button 
      onClick={openDrawer}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '0.25rem', 
        color: 'var(--muted-foreground)', 
        position: 'relative',
        background: 'none',
        border: 'none',
        fontFamily: 'inherit',
        cursor: 'pointer'
      }}
    >
      <ShoppingCart size={20} />
      {cartItemCount > 0 && (
        <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '0.6rem', fontWeight: 'bold', padding: '0.1rem 0.3rem', borderRadius: '999px' }}>{cartItemCount}</span>
      )}
      <span style={{ fontSize: '0.65rem' }}>Cart</span>
    </button>
  )
}
