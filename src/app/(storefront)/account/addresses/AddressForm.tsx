'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addAddress } from '@/lib/actions/account'

export function AddressForm() {
  const [state, action, isPending] = useActionState(addAddress, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Add New Address</h3>
      
      {state?.error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>
          {state.error}
        </div>
      )}

      {state?.success && (
        <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#15803d', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid #86efac' }}>
          Address saved successfully!
        </div>
      )}

      <form ref={formRef} action={action} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="first_name">First Name</label>
          <input type="text" id="first_name" name="first_name" className="form-input" required disabled={isPending} />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="last_name">Last Name</label>
          <input type="text" id="last_name" name="last_name" className="form-input" required disabled={isPending} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label" htmlFor="address_line1">Address Line 1</label>
          <input type="text" id="address_line1" name="address_line1" className="form-input" required placeholder="Street address, P.O. box, company name, c/o" disabled={isPending} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label" htmlFor="address_line2">Address Line 2 (Optional)</label>
          <input type="text" id="address_line2" name="address_line2" className="form-input" placeholder="Apartment, suite, unit, building, floor, etc." disabled={isPending} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="city">City</label>
          <input type="text" id="city" name="city" className="form-input" required disabled={isPending} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="postal_code">Postal Code</label>
          <input type="text" id="postal_code" name="postal_code" className="form-input" required disabled={isPending} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" className="form-input" required disabled={isPending} />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center', marginTop: '1rem' }}>
          <input type="checkbox" id="is_default" name="is_default" style={{ width: '1rem', height: '1rem' }} disabled={isPending} />
          <label htmlFor="is_default" style={{ fontSize: '0.875rem' }}>Set as default shipping address</label>
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={isPending} style={{ opacity: isPending ? 0.7 : 1 }}>
            {isPending ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </form>
    </div>
  )
}
