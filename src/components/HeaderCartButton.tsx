'use client'

import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartDrawer } from '@/providers/CartDrawerProvider'

export default function HeaderCartButton({ cartItemCount }: { cartItemCount: number }) {
  const { openDrawer } = useCartDrawer()

  return (
    <button 
      onClick={openDrawer}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        backgroundColor: '#1f1f1f',
        border: '1px solid var(--accent)',
        borderRadius: '6px',
        padding: '0.5rem 1rem',
        color: 'var(--accent)',
        fontWeight: 700,
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
        flexShrink: 0,
      }}
    >
      <ShoppingCart size={18} />
      CART
      {cartItemCount > 0 && (
        <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          {cartItemCount}
        </span>
      )}
    </button>
  )
}
