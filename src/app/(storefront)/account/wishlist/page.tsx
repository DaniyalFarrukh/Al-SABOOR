import { getWishlist } from '@/lib/actions/account'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { RemoveFromWishlistButton } from './RemoveFromWishlistButton'
import { getUser } from '@/lib/actions/auth'

export default async function WishlistPage() {
  const wishlistItems = await getWishlist()
  const user = await getUser()
  const isWholesaler = user?.profile?.roles?.name === 'Retailer' || user?.profile?.roles?.name === 'Wholesaler'

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        My Wishlist
      </h2>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted-foreground)' }}>
          <p style={{ marginBottom: '1rem' }}>Your wishlist is currently empty.</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {wishlistItems.map((item: any) => (
            <div key={item.product_id} style={{ position: 'relative' }}>
              <ProductCard product={{ id: item.product_id, ...item.products }} isWholesaler={isWholesaler} />
              <RemoveFromWishlistButton productId={item.product_id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
