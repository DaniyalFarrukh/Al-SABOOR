import { getCategory, updateCategory, getCategories } from '@/lib/actions/categories'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  const [category, categories] = await Promise.all([
    getCategory(params.id),
    getCategories()
  ])

  async function action(formData: FormData) {
    'use server'
    const res = await updateCategory(params.id, formData)
    if (res?.success) {
      redirect('/admin/categories')
    }
  }

  return (
    <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="admin-header">
        <h1 className="admin-title">Edit Category: {category.name}</h1>
      </div>
      
      <form action={action} encType="multipart/form-data">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Category Name</label>
          <input type="text" id="name" name="name" className="form-input" defaultValue={category.name} required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slug">Slug (URL-friendly)</label>
          <input type="text" id="slug" name="slug" className="form-input" defaultValue={category.slug} required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="parent_id">Parent Category (Optional)</label>
          <select id="parent_id" name="parent_id" className="form-input" defaultValue={category.parent_id || ''}>
            <option value="">None (Top Level)</option>
            {categories?.filter(c => c.id !== category.id).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-input" rows={4} defaultValue={category.description || ''}></textarea>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="image">Category Image</label>
          {category.image_url && (
            <div style={{ marginBottom: '1rem' }}>
              <img src={category.image_url} alt="Current Image" style={{ maxWidth: '100px', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          )}
          <input type="file" id="image" name="image" accept="image/*" className="form-input" />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="is_active" name="is_active" value="true" defaultChecked={category.is_active} style={{ width: '1.25rem', height: '1.25rem' }} />
          <label htmlFor="is_active" style={{ fontWeight: 500 }}>Active (Visible on Storefront)</label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary">Save Changes</button>
          <Link href="/admin/categories" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
