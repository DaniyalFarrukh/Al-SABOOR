import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, User, Phone, Mail, MapPin } from 'lucide-react'
import { getOrderByNumber } from '@/lib/actions/checkout'
import { notFound } from 'next/navigation'

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ order_number: string }> }) {
  const resolvedParams = await params
  const order = await getOrderByNumber(resolvedParams.order_number)

  if (!order) {
    notFound()
  }
  
  return (
    <div className="storefront-container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
      
      <div className="admin-card" style={{ width: '100%', maxWidth: '700px', padding: '3rem 2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={48} />
          </div>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '1rem', textAlign: 'center' }}>Order Confirmed</h1>
        
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', marginBottom: '2.5rem', textAlign: 'center' }}>
          Thank you for your purchase! We've received your order and are currently processing it.
        </p>

        {/* Order Details Header */}
        <div style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Package size={24} style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Order Number</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'monospace' }}>{order.order_number}</p>
            </div>
          </div>
          <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)' }}></div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Order ID</p>
            <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>{order.id}</p>
          </div>
        </div>

        {/* Customer Information */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Customer Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <User size={18} style={{ color: 'var(--muted-foreground)', marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600 }}>Name</p>
              <p style={{ color: 'var(--muted-foreground)' }}>{order.customer_first_name} {order.customer_last_name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Phone size={18} style={{ color: 'var(--muted-foreground)', marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600 }}>Contact</p>
              <p style={{ color: 'var(--muted-foreground)' }}>{order.customer_phone}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Mail size={18} style={{ color: 'var(--muted-foreground)', marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600 }}>Email</p>
              <p style={{ color: 'var(--muted-foreground)' }}>{order.customer_email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <MapPin size={18} style={{ color: 'var(--muted-foreground)', marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600 }}>Shipping Address</p>
              <p style={{ color: 'var(--muted-foreground)' }}>
                {order.shipping_address_line1}<br/>
                {order.shipping_address_line2 && <>{order.shipping_address_line2}<br/></>}
                {order.shipping_city}, {order.shipping_state || ''} {order.shipping_postal_code}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Order Summary</h3>
        <div style={{ marginBottom: '2.5rem' }}>
          {order.order_items?.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{item.product?.name || 'Unknown Product'}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Qty: {item.quantity}</p>
              </div>
              <p style={{ fontWeight: 600 }}>Rs. {(item.unit_price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', color: 'var(--muted-foreground)' }}>
            <p>Subtotal</p>
            <p>Rs. {order.subtotal.toLocaleString()}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--muted-foreground)' }}>
            <p>Shipping</p>
            <p>Rs. {order.shipping_cost.toLocaleString()}</p>
          </div>
          {order.discount_total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--success)' }}>
              <p>Discount</p>
              <p>- Rs. {order.discount_total.toLocaleString()}</p>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
            <p>Total</p>
            <p>Rs. {order.grand_total.toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/account/orders" className="btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>
            View Order Status
          </Link>
          <Link href="/products" className="btn-secondary" style={{ justifyContent: 'center', padding: '1rem' }}>
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>

      </div>

    </div>
  )
}
