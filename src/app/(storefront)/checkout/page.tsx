import { getCart } from '@/lib/actions/cart'
import { processCheckout } from '@/lib/actions/checkout'
import { getUser } from '@/lib/actions/auth'
import { getAddresses } from '@/lib/actions/account'
import { redirect } from 'next/navigation'
import { ShieldCheck, Truck, CreditCard } from 'lucide-react'

export default async function CheckoutPage() {
  const cartData = await getCart()

  if (!cartData || cartData.items.length === 0) {
    redirect('/cart')
  }

  // Pre-fill data if user is logged in
  const user = await getUser()
  let defaultAddress: any = null
  
  if (user) {
    const addresses = await getAddresses()
    defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0] || null
  }

  const shippingCost = 250
  const grandTotal = cartData.subtotal + shippingCost

  return (
    <div className="storefront-container" style={{ padding: '3rem 1rem', minHeight: '80vh' }}>
      
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Secure Checkout</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>Complete your order details below.</p>
      </div>

      <form action={async (formData) => {
        'use server'
        await processCheckout(formData)
      }} className="responsive-grid checkout-grid">
        
        {/* Left Column: Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Section: Contact */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} /> Contact Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" className="form-input" required defaultValue={user?.email || ''} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="first_name">First Name</label>
                <input type="text" id="first_name" name="first_name" className="form-input" required defaultValue={defaultAddress?.first_name || user?.profile?.first_name || ''} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="last_name">Last Name</label>
                <input type="text" id="last_name" name="last_name" className="form-input" required defaultValue={defaultAddress?.last_name || user?.profile?.last_name || ''} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" className="form-input" required defaultValue={defaultAddress?.phone || user?.profile?.phone || ''} />
              </div>
            </div>
          </section>

          {/* Section: Shipping */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} /> Shipping Address
            </h2>
            <div className="two-col-form">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="address_line1">Street Address</label>
                <input type="text" id="address_line1" name="address_line1" className="form-input" required defaultValue={defaultAddress?.address_line1 || ''} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="address_line2">Apartment, suite, etc. (optional)</label>
                <input type="text" id="address_line2" name="address_line2" className="form-input" defaultValue={defaultAddress?.address_line2 || ''} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input type="text" id="city" name="city" className="form-input" required defaultValue={defaultAddress?.city || ''} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postal_code">Postal Code</label>
                <input type="text" id="postal_code" name="postal_code" className="form-input" required defaultValue={defaultAddress?.postal_code || ''} />
              </div>
            </div>
          </section>

          {/* Section: Payment */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} /> Payment Method
            </h2>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', backgroundColor: 'var(--muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input type="radio" id="cod" name="payment_method" value="COD" defaultChecked style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }} />
                <label htmlFor="cod" style={{ fontWeight: 600, fontSize: '1.125rem', cursor: 'pointer' }}>Cash on Delivery (COD)</label>
              </div>
              <p style={{ marginTop: '0.75rem', marginLeft: '2.25rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Pay with cash upon delivery of your order.</p>
            </div>
            
            <div style={{ marginTop: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input type="radio" id="card" name="payment_method" value="CARD" disabled style={{ width: '1.25rem', height: '1.25rem' }} />
                <label htmlFor="card" style={{ fontWeight: 600, fontSize: '1.125rem' }}>Credit/Debit Card (Coming Soon)</label>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Order Summary */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {cartData.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--muted)', borderRadius: '4px', flexShrink: 0, position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--primary)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {item.quantity}
                    </span>
                    <img src={item.products?.product_images?.[0]?.image_url || '/placeholder.png'} alt={item.products?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.4 }}>{item.products?.name}</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Rs. {item.price.toLocaleString()}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                    Rs. {item.itemTotal.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
                <span style={{ fontWeight: 500 }}>Rs. {cartData.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Shipping</span>
                <span style={{ fontWeight: 500 }}>Rs. {shippingCost.toLocaleString()}</span>
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
                <label className="form-label" htmlFor="coupon_code" style={{ fontSize: '0.875rem' }}>Discount Code (Optional)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" id="coupon_code" name="coupon_code" className="form-input" placeholder="e.g. SUMMER2026" style={{ textTransform: 'uppercase' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Discount will be calculated and applied after confirmation.</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>Rs. {grandTotal.toLocaleString()}</span>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Confirm Order
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
              By confirming your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </form>
    </div>
  )
}
