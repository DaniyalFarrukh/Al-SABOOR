import { getCategories, deleteCategory } from '@/lib/actions/categories'
import Link from 'next/link'
import { Plus, Trash2, Edit } from 'lucide-react'
import CategoryImportModal from './CategoryImportModal'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Categories Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <CategoryImportModal />
          <Link href="/admin/categories/new" className="btn-primary">
            <Plus size={16} style={{ marginRight: '0.25rem' }} />
            Add Category
          </Link>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 500 }}>
                  {cat.name}
                </td>
                <td><code style={{ fontSize: '0.75rem', background: 'var(--muted)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{cat.slug}</code></td>
                <td>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 500,
                    backgroundColor: cat.is_active ? '#dcfce7' : '#fef2f2',
                    color: cat.is_active ? '#166534' : '#991b1b'
                  }}>
                    {cat.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link href={`/admin/categories/${cat.id}`} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center' }}>
                    <Edit size={14} />
                  </Link>
                  <form action={deleteCategory.bind(null, cat.id)}>
                    <button type="submit" className="btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
