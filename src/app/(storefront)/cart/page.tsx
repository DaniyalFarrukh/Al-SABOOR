import { getCart, updateCartQuantity, removeFromCart } from '@/lib/actions/cart'
import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import CartItemQuantity from './CartItemQuantity'

export default async function CartPage() {
  const cartData = await getCart()

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="storefront-container" style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--muted-foreground)' }}>
          <ShoppingBag size={64} style={{ opacity: 0.5 }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--foreground)' }}>Your Cart is Empty</h1>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '1rem', padding: '0.75rem 2rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const shippingCost = 250 // Flat rate shipping placeholder for Pakistan

  return (
    <div className="storefront-container" style={{ padding: '2rem 1rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Shopping Cart</h1>

      <div className="responsive-grid cart-grid">
        
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartData.items.map((item: any) => {
            const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary)?.image_url 
              || item.products?.product_images?.[0]?.image_url 
              || '/placeholder.png';
            
            return (
              <div key={item.id} className="admin-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius)', overflow: 'hidden', backgroundColor: 'var(--muted)', flexShrink: 0 }}>
                  <img src={primaryImage} alt={item.products?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <Link href={`/product/${encodeURIComponent(item.products?.slug)}`} style={{ fontSize: '1.125rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    {item.products?.name}
                  </Link>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>
                    Rs. {item.price.toLocaleString()}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    
                    <CartItemQuantity 
                      itemId={item.id} 
                      quantity={item.quantity} 
                      updateAction={async (formData) => {
                        'use server'
                        const newQty = parseInt(formData.get('quantity') as string)
                        await updateCartQuantity(item.id, newQty)
                      }} 
                    />

                    <form action={async () => {
                      'use server'
                      await removeFromCart(item.id)
                    }}>
                      <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.875rem' }}>
                        <Trash2 size={16} /> Remove
                      </button>
                    </form>
                    
                  </div>
                </div>
                
                <div style={{ fontWeight: 700, fontSize: '1.25rem', textAlign: 'right' }}>
                  Rs. {item.itemTotal.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="admin-card" style={{ position: 'sticky', top: '6rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Subtotal ({cartData.itemCount} items)</span>
            <span style={{ fontWeight: 500 }}>Rs. {cartData.subtotal.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Shipping Estimate</span>
            <span style={{ fontWeight: 500 }}>Rs. {shippingCost.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem' }}>
            <span style={{ fontWeight: 600 }}>Grand Total</span>
            <span style={{ fontWeight: 800 }}>Rs. {(cartData.subtotal + shippingCost).toLocaleString()}</span>
          </div>

          <Link href="/checkout" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.125rem' }}>
            Proceed to Checkout <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
