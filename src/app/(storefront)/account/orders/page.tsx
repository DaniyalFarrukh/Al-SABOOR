import React from 'react'
import { Package, ChevronRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let orders = []
  if (user) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    orders = data || []
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        Order History
      </h2>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Package size={48} style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', opacity: 0.5, margin: '0 auto' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No orders yet</h3>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            When you place an order, it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order: any) => (
            <Link 
              href={`/checkout/success/${order.order_number}`}
              key={order.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s, box-shadow 0.15s'
              }}
              className="order-card-hover"
            >
              <div>
                <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{order.order_number}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600 }}>Rs. {order.grand_total.toLocaleString()}</p>
                  <span style={{ 
                    display: 'inline-block',
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    backgroundColor: order.status === 'pending' ? '#fef08a' : order.status === 'delivered' ? '#bbf7d0' : '#e5e7eb',
                    color: order.status === 'pending' ? '#854d0e' : order.status === 'delivered' ? '#166534' : '#374151',
                    borderRadius: '99px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginTop: '0.25rem'
                  }}>
                    {order.status}
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </Link>
          ))}
          <style>{`
            .order-card-hover:hover {
              border-color: var(--primary);
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
