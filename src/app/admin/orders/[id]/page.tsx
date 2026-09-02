import { getAdminOrderDetails, updateOrderStatus } from '@/lib/actions/admin-orders'
import { addShipment } from '@/lib/actions/shipping'
import { processRefund } from '@/lib/actions/payments'
import { redirect } from 'next/navigation'
import { Printer, Calendar, MapPin, User, ArrowLeft, Truck, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const order = await getAdminOrderDetails(resolvedParams.id)

  if (!order) {
    redirect('/admin/orders')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/orders" style={{ padding: '0.5rem', backgroundColor: 'var(--muted)', borderRadius: '4px', color: 'var(--foreground)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>{order.order_number}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> {new Date(order.created_at).toLocaleString()}</span>
            <span>Source: <strong style={{ textTransform: 'uppercase' }}>{order.order_source}</strong></span>
          </div>
        </div>
        <div style={{ flex: 1 }}></div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> Print Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Order Items</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.5rem 0', textAlign: 'left', color: 'var(--muted-foreground)', fontWeight: 500 }}>Product</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'center', color: 'var(--muted-foreground)', fontWeight: 500 }}>Qty</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--muted-foreground)', fontWeight: 500 }}>Unit Price</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--muted-foreground)', fontWeight: 500 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0' }}>
                      <div style={{ fontWeight: 600 }}>{item.products?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>SKU: {item.products?.sku}</div>
                    </td>
                    <td style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', color: 'var(--muted-foreground)' }}>Rs. {item.unit_price.toLocaleString()}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600 }}>Rs. {item.total_price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 500 }}>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '2rem', color: 'var(--muted-foreground)' }}>
                <span>Shipping:</span>
                <span style={{ fontWeight: 500 }}>Rs. {order.shipping_cost.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary)' }}>Rs. {order.grand_total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Update Status</h2>
            <form action={async (formData) => {
              'use server'
              const status = formData.get('status') as string
              const notes = formData.get('notes') as string
              await updateOrderStatus(order.id, status, notes)
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="form-group">
                <label className="form-label">Current Status: <strong style={{ textTransform: 'uppercase' }}>{order.status}</strong></label>
                <select name="status" className="form-input" defaultValue={order.status}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Update Notes (Optional)</label>
                <input type="text" name="notes" className="form-input" placeholder="e.g. Tracking number: 12345" />
              </div>

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Update Order</button>
            </form>
          </div>

          <div className="admin-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} /> Shipments
            </h2>
            
            {order.shipments.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem 0', textAlign: 'left', color: 'var(--muted-foreground)', fontWeight: 500 }}>Courier</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'left', color: 'var(--muted-foreground)', fontWeight: 500 }}>Tracking No</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--muted-foreground)', fontWeight: 500 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order.shipments.map((shipment: any) => (
                    <tr key={shipment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 600 }}>{shipment.courier_name}</td>
                      <td style={{ padding: '1rem 0', fontFamily: 'monospace' }}>{shipment.tracking_number || '-'}</td>
                      <td style={{ padding: '1rem 0', textAlign: 'right', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>{shipment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>No shipments created yet.</p>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Create Shipment</h3>
            <form action={async (formData) => {
              'use server'
              const courier = formData.get('courier_name') as string
              const tracking = formData.get('tracking_number') as string
              if (courier && tracking) {
                await addShipment(order.id, courier, tracking)
              }
            }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group">
                <label className="form-label">Courier Name</label>
                <input type="text" name="courier_name" className="form-input" placeholder="e.g. TCS" required />
              </div>
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input type="text" name="tracking_number" className="form-input" placeholder="Tracking ID" required />
              </div>
              <button type="submit" className="btn-secondary" style={{ height: '42px' }}>Add Shipment</button>
            </form>
          </div>

        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
          
          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> Customer Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{order.customer_first_name} {order.customer_last_name}</p>
              <p style={{ color: 'var(--muted-foreground)' }}><a href={`mailto:${order.customer_email}`} style={{ color: 'var(--primary)' }}>{order.customer_email}</a></p>
              <p style={{ color: 'var(--muted-foreground)' }}><a href={`tel:${order.customer_phone}`} style={{ color: 'var(--primary)' }}>{order.customer_phone}</a></p>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} /> Shipping Address
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>{order.shipping_city}, {order.shipping_state || ''}</p>
              <p>{order.shipping_postal_code}</p>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} /> Payments
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Method:</span>
              <strong style={{ textTransform: 'uppercase' }}>{order.payment_method}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Status:</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 600, color: order.payment_status === 'paid' ? '#22c55e' : 'var(--foreground)' }}>{order.payment_status}</span>
            </div>

            {order.payments.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Transaction Log</h4>
                {order.payments.map((payment: any) => (
                  <div key={payment.id} style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>{payment.provider}</span>
                      <span>Rs. {payment.amount.toLocaleString()}</span>
                    </div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Ref: {payment.transaction_reference}</div>
                    
                    {payment.refunds && payment.refunds.length > 0 && (
                      <div style={{ marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid #ef4444' }}>
                        {payment.refunds.map((refund: any) => (
                          <div key={refund.id} style={{ color: '#ef4444', fontSize: '0.75rem' }}>
                            Refunded: Rs. {refund.amount.toLocaleString()} ({refund.status})
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <form action={async (formData) => {
                      'use server'
                      const amt = parseFloat(formData.get('amount') as string)
                      const reason = formData.get('reason') as string
                      if (amt > 0) {
                        await processRefund(payment.id, amt, reason)
                      }
                    }} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input type="number" name="amount" placeholder="Refund Amount" max={payment.amount} step="0.01" required style={{ padding: '0.25rem', fontSize: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent' }} />
                      <input type="text" name="reason" placeholder="Reason" required style={{ padding: '0.25rem', fontSize: '0.75rem', width: '100%', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent' }} />
                      <button type="submit" style={{ padding: '0.25rem', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Issue Refund</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border)' }}></div>
              
              {order.history.map((entry: any, index: number) => (
                <div key={entry.id} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: index === order.history.length - 1 ? 'var(--primary)' : 'var(--muted-foreground)', border: '4px solid var(--background)', flexShrink: 0, marginTop: '2px' }}></div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{entry.status}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{new Date(entry.created_at).toLocaleString()}</div>
                    {entry.notes && <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', backgroundColor: 'var(--muted)', padding: '0.5rem', borderRadius: '4px' }}>{entry.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
