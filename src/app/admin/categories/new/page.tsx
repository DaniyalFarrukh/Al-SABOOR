import { createCategory, getCategories } from '@/lib/actions/categories'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewCategoryPage() {
  const categories = await getCategories()

  async function action(formData: FormData) {
    'use server'
    const res = await createCategory(formData)
    if (res?.success) {
      redirect('/admin/categories')
    }
  }

  return (
    <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="admin-header">
        <h1 className="admin-title">Create Category</h1>
      </div>
      
      <form action={action} encType="multipart/form-data">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Category Name</label>
          <input type="text" id="name" name="name" className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slug">Slug (URL-friendly)</label>
          <input type="text" id="slug" name="slug" className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="parent_id">Parent Category (Optional)</label>
          <select id="parent_id" name="parent_id" className="form-input">
            <option value="">None (Top Level)</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-input" rows={4}></textarea>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="image">Category Image</label>
          <input type="file" id="image" name="image" accept="image/*" className="form-input" />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="is_active" value="true" defaultChecked />
            <span className="form-label" style={{ margin: 0 }}>Active</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary">Save Category</button>
          <Link href="/admin/categories" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
