'use client'

import { useTransition } from 'react'
import { deleteAddress } from '@/lib/actions/account'
import { Trash2 } from 'lucide-react'

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this address?')) {
      startTransition(async () => {
        await deleteAddress(addressId)
      })
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.25rem', 
        color: '#ef4444', 
        fontSize: '0.75rem', 
        fontWeight: 500,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1
      }}
    >
      <Trash2 size={14} /> 
      {isPending ? 'Removing...' : 'Remove Address'}
    </button>
  )
}
