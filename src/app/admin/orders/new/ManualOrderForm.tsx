'use client'

import { useState } from 'react'
import { createManualOrder } from '@/lib/actions/admin-orders'
import { Plus, Trash2, Loader2 } from 'lucide-react'

export default function ManualOrderForm({ catalog }: { catalog: any[] }) {
  const [items, setItems] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  })
  
  const [shippingCost, setShippingCost] = useState(0)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState('')

  const handleAddItem = () => {
    if (!selectedProductId) return
    const product = catalog.find(p => p.id === selectedProductId)
    if (!product) return

    const variant = product.variants.find((v: any) => v.id === selectedVariantId)
    const name = variant ? `${product.name} - ${variant.name}` : product.name
    const price = variant ? variant.price : product.price

    setItems([...items, {
      id: Math.random().toString(),
      product_id: product.id,
      variant_id: variant ? variant.id : null,
      name,
      quantity: 1,
      unit_price: price
    }])
    
    setSelectedProductId('')
    setSelectedVariantId('')
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const grandTotal = subtotal + Number(shippingCost || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      setError('Please add at least one item to the order.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await createManualOrder({
        ...customer,
        shippingCost: Number(shippingCost || 0),
        subtotal,
        grandTotal,
        items
      })

      if (res.error) {
        setError(res.error)
      } else {
        window.location.href = `/admin/orders/${res.order_id}`
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProductObj = catalog.find(p => p.id === selectedProductId)

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius)' }}>
          {error}
        </div>
      )}

      {/* Customer Information */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Customer Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input required type="text" className="form-input" value={customer.firstName} onChange={e => setCustomer({...customer, firstName: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input required type="text" className="form-input" value={customer.lastName} onChange={e => setCustomer({...customer, lastName: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input required type="email" className="form-input" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input required type="tel" className="form-input" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address Line 1 *</label>
            <input required type="text" className="form-input" value={customer.addressLine1} onChange={e => setCustomer({...customer, addressLine1: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Address Line 2</label>
            <input type="text" className="form-input" value={customer.addressLine2} onChange={e => setCustomer({...customer, addressLine2: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input required type="text" className="form-input" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">State/Province</label>
            <input type="text" className="form-input" value={customer.state} onChange={e => setCustomer({...customer, state: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Postal Code *</label>
            <input required type="text" className="form-input" value={customer.postalCode} onChange={e => setCustomer({...customer, postalCode: e.target.value})} />
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Order Items</h2>
        
        {/* Item Selector */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)' }}>
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <label className="form-label">Select Product</label>
            <select className="form-input" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
              <option value="">-- Choose Product --</option>
              {catalog.map(p => (
                <option key={p.id} value={p.id}>{p.sku ? `[${p.sku}] ` : ''}{p.name}</option>
              ))}
            </select>
          </div>
          
          {selectedProductObj && selectedProductObj.variants.length > 0 && (
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Select Variant</label>
              <select className="form-input" value={selectedVariantId} onChange={e => setSelectedVariantId(e.target.value)}>
                <option value="">-- Choose Variant --</option>
                {selectedProductObj.variants.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="button"
            onClick={handleAddItem}
            disabled={!selectedProductId || (selectedProductObj?.variants.length > 0 && !selectedVariantId)}
            className="btn-primary" 
            style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Selected Items List */}
        {items.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.75rem 0', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Product</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'center', fontWeight: 600, color: 'var(--muted-foreground)', width: '120px' }}>Quantity</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600, color: 'var(--muted-foreground)' }}>Unit Price</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600, color: 'var(--muted-foreground)' }}>Total</th>
                <th style={{ padding: '0.75rem 0', textAlign: 'center', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                    <input 
                      type="number" 
                      min="1" 
                      className="form-input" 
                      style={{ width: '80px', margin: '0 auto', textAlign: 'center' }}
                      value={item.quantity}
                      onChange={e => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    />
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>Rs. {item.unit_price.toLocaleString()}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600 }}>Rs. {(item.unit_price * item.quantity).toLocaleString()}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                    <button type="button" onClick={() => handleRemoveItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-text)', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}>
            No items added yet. Use the selector above to add products.
          </div>
        )}
      </div>

      {/* Order Summary & Submission */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '100%', maxWidth: '350px', backgroundColor: 'var(--muted)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
            <span style={{ fontWeight: 600 }}>Rs. {subtotal.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Shipping Cost</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Rs.</span>
              <input 
                type="number" 
                min="0" 
                className="form-input" 
                style={{ width: '100px', textAlign: 'right', padding: '0.25rem 0.5rem' }}
                value={shippingCost}
                onChange={e => setShippingCost(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '1.25rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>Rs. {grandTotal.toLocaleString()}</span>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Create Order'}
          </button>
        </div>
      </div>
      
    </form>
  )
}
