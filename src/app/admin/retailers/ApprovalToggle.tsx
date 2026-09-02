'use client'

import { toggleRetailerApproval } from '@/lib/actions/customers'
import { useTransition } from 'react'

export default function ApprovalToggle({ id, currentStatus }: { id: string, currentStatus: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await toggleRetailerApproval(id, currentStatus)
        })
      }}
      disabled={isPending}
      className={`btn-${currentStatus ? 'danger' : 'primary'}`}
      style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
    >
      {isPending ? 'Updating...' : currentStatus ? 'Revoke Access' : 'Approve Retailer'}
    </button>
  )
}
