import { getBrands, deleteBrand } from '@/lib/actions/brands'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'

export default async function AdminBrandsPage() {
  const brands = await getBrands()

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Brands Management</h1>
        <Link href="/admin/brands/new" className="btn-primary">
          <Plus size={16} />
          Add Brand
        </Link>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands?.map((brand) => (
              <tr key={brand.id}>
                <td style={{ fontWeight: 500 }}>{brand.name}</td>
                <td><code style={{ fontSize: '0.75rem', background: 'var(--muted)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{brand.slug}</code></td>
                <td style={{ color: 'var(--muted-foreground)' }}>{brand.description || '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <form action={async () => {
                    'use server'
                    await deleteBrand(brand.id)
                  }}>
                    <button type="submit" className="btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(!brands || brands.length === 0) && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
