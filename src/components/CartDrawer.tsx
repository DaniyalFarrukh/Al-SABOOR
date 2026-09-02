'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight, ClipboardList, Truck, Tag } from 'lucide-react'
import { useCartDrawer } from '@/providers/CartDrawerProvider'
import CartItemQuantity from '@/app/(storefront)/cart/CartItemQuantity'
import { removeFromCart, updateCartQuantity } from '@/lib/actions/cart'

export default function CartDrawer({ cartData, suggestedProducts }: { cartData: any, suggestedProducts: any[] }) {
  const { isOpen, closeDrawer } = useCartDrawer()
  const [isMounted, setIsMounted] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const handleRemove = async (itemId: string) => {
    setIsUpdating(true)
    await removeFromCart(itemId)
    setIsUpdating(false)
  }

  const handleUpdateQty = async (itemId: string, formData: FormData) => {
    setIsUpdating(true)
    const newQty = parseInt(formData.get('quantity') as string)
    await updateCartQuantity(itemId, newQty)
    setIsUpdating(false)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          backgroundColor: '#fff',
          zIndex: 9999,
          boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #eaeaea' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1a1b1c' }}>Shopping Cart</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{cartData?.itemCount || 0} items</p>
          </div>
          <button onClick={closeDrawer} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={24} color="#1a1b1c" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', opacity: isUpdating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          
          {/* Cart Items */}
          {(!cartData || cartData.items.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
              Your cart is empty.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cartData.items.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  
                  {/* Image */}
                  <div style={{ width: '80px', height: '80px', flexShrink: 0, backgroundColor: '#f9fafb', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    {item.products.product_images?.[0]?.image_url ? (
                      <Image 
                        src={item.products.product_images[0].image_url} 
                        alt={item.products.name} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                      />
                    ) : null}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: '#1a1b1c', lineHeight: 1.3 }}>
                      {item.products.name}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9ca3af' }}>
                        Rs{(item.price || item.itemTotal / item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444' }}>
                        Rs{(item.price || item.itemTotal / item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <CartItemQuantity 
                        itemId={item.id} 
                        quantity={item.quantity} 
                        updateAction={(formData) => handleUpdateQty(item.id, formData)}
                      />
                    </div>
                  </div>

                  {/* Remove btn */}
                  <button 
                    onClick={() => handleRemove(item.id)} 
                    style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                  >
                    <X size={16} color="#6b7280" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '2rem 0' }} />

          {/* You May Also Like */}
          {suggestedProducts && suggestedProducts.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>You May Also Like</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={16} color="#6b7280" />
                  </button>
                  <button style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={16} color="#6b7280" />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                {suggestedProducts.slice(0, 3).map((prod) => (
                  <div key={prod.id} style={{ minWidth: '150px', background: '#f9fafb', padding: '1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', position: 'relative' }}>
                       {prod.product_images?.[0]?.image_url && (
                         <Image src={prod.product_images[0].image_url} alt={prod.name} fill style={{ objectFit: 'contain' }} />
                       )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{prod.name}</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Rs{((prod.product_pricing?.[0]?.sale_price || prod.product_pricing?.[0]?.retail_price) || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Value Props Icons */}
          <div style={{ display: 'flex', border: '1px solid #eaeaea', borderRadius: '4px', marginTop: '2rem' }}>
            <div style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', borderRight: '1px solid #eaeaea' }}><ClipboardList size={24} color="#6b7280" /></div>
            <div style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', borderRight: '1px solid #eaeaea' }}><Truck size={24} color="#6b7280" /></div>
            <div style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center' }}><Tag size={24} color="#6b7280" /></div>
          </div>
          
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #eaeaea', backgroundColor: '#fff' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Subtotal:</span>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Rs{(cartData?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Total:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Rs{(cartData?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.5rem' }}>Tax included and shipping calculated at checkout</p>

          <Link href="/checkout" onClick={closeDrawer} style={{ 
            display: 'block', 
            width: '100%', 
            backgroundColor: '#1a1b1c', 
            color: '#fff', 
            textAlign: 'center', 
            padding: '1rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em', 
            marginBottom: '0.5rem',
            textDecoration: 'none'
          }}>
            CHECKOUT
          </Link>
          
          <Link href="/cart" onClick={closeDrawer} style={{ 
            display: 'block', 
            width: '100%', 
            backgroundColor: 'transparent', 
            border: '1px solid #1a1b1c',
            color: '#1a1b1c', 
            textAlign: 'center', 
            padding: '1rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em',
            textDecoration: 'none'
          }}>
            VIEW CART
          </Link>
          
          {/* Floating WhatsApp Icon */}
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923000000000'}`} target="_blank" rel="noopener noreferrer" style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#25D366',
            color: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            zIndex: 10000,
            textDecoration: 'none'
          }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>

      </div>
    </>
  )
}
