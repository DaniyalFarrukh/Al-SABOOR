'use client'

import React, { useRef } from 'react'

export default function CartItemQuantity({ 
  itemId, 
  quantity, 
  updateAction 
}: { 
  itemId: string, 
  quantity: number, 
  updateAction: (formData: FormData) => void 
}) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={updateAction} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor={`qty-${itemId}`} style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Qty:</label>
      <input 
        type="number" 
        id={`qty-${itemId}`} 
        name="quantity" 
        defaultValue={quantity} 
        min="1" 
        className="form-input" 
        style={{ width: '70px', padding: '0.25rem 0.5rem' }} 
        onBlur={() => formRef.current?.requestSubmit()}
        onChange={() => formRef.current?.requestSubmit()}
      />
      <noscript><button type="submit" className="btn-secondary" style={{ padding: '0.25rem' }}>Update</button></noscript>
    </form>
  )
}
