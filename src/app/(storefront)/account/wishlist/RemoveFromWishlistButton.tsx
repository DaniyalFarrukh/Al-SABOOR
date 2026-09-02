'use client'

import { useTransition } from 'react'
import { toggleWishlist } from '@/lib/actions/account'
import { Trash2, Loader2 } from 'lucide-react'

export function RemoveFromWishlistButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    startTransition(async () => {
      await toggleWishlist(productId)
    })
  }

  return (
    <button 
      onClick={handleRemove}
      disabled={isPending}
      style={{ 
        position: 'absolute', 
        top: '0.5rem', 
        right: '0.5rem', 
        zIndex: 20,
        backgroundColor: 'white', 
        color: '#ef4444', 
        width: '32px', 
        height: '32px', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: 'none',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.7 : 1
      }}
      aria-label="Remove from wishlist"
    >
      {isPending ? <Loader2 size={16} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} /> : <Trash2 size={16} />}
    </button>
  )
}
