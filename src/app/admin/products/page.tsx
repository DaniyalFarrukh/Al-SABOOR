import { getProducts, deleteProduct } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import Link from 'next/link'
import { Plus, Trash2, Edit, Search } from 'lucide-react'
import ProductImportModal from './ProductImportModal'

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const searchParams = await props.searchParams
  const page = parseInt(searchParams.page || '1') || 1
  const q = searchParams.q || ''
  const category_id = searchParams.category_id || ''

  const [productsRes, categories] = await Promise.all([
    getProducts({ page, limit: 20, q, category_id }),
    getCategories()
  ])

  const { data: products, totalPages } = productsRes

  return (
    <div>
      <div className="admin-header" style={{ marginBottom: '1rem' }}>
        <h1 className="admin-title">Products Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ProductImportModal />
          <Link href="/admin/products/new" className="btn-primary">
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form method="GET" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input 
              type="search" 
              name="q" 
              placeholder="Search by name or SKU..." 
              className="form-input" 
              style={{ paddingLeft: '2rem' }}
              defaultValue={q}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <select name="category_id" className="form-input" defaultValue={category_id}>
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-secondary">Filter</button>
          
          {(q || category_id) && (
            <Link href="/admin/products" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((prod: any) => (
              <tr key={prod.id}>
                <td><code style={{ fontSize: '0.75rem', background: 'var(--muted)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{prod.sku}</code></td>
                <td style={{ fontWeight: 500 }}>{prod.name}</td>
                <td>{prod.categories?.name || '-'}</td>
                <td>{prod.brands?.name || '-'}</td>
                <td>Rs. {prod.product_pricing?.[0]?.retail_price?.toLocaleString() || '0'}</td>
                <td>{prod.inventory?.[0]?.quantity || '0'}</td>
                <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link href={`/admin/products/${prod.id}`} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center' }}>
                    <Edit size={14} />
                  </Link>
                  <form action={async () => {
                    'use server'
                    await deleteProduct(prod.id)
                  }}>
                    <button type="submit" className="btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            Page {page} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {page > 1 ? (
              <Link href={`/admin/products?page=${page - 1}${q ? `&q=${q}` : ''}${category_id ? `&category_id=${category_id}` : ''}`} className="btn-secondary">
                Previous
              </Link>
            ) : (
              <button className="btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Previous</button>
            )}
            
            {page < totalPages ? (
              <Link href={`/admin/products?page=${page + 1}${q ? `&q=${q}` : ''}${category_id ? `&category_id=${category_id}` : ''}`} className="btn-secondary">
                Next
              </Link>
            ) : (
              <button className="btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Next</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
