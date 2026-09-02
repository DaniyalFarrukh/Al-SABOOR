import { createBrand } from '@/lib/actions/brands'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function NewBrandPage() {
  async function action(formData: FormData) {
    'use server'
    const res = await createBrand(formData)
    if (res?.success) {
      redirect('/admin/brands')
    }
  }

  return (
    <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="admin-header">
        <h1 className="admin-title">Create Brand</h1>
      </div>
      
      <form action={action}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Brand Name</label>
          <input type="text" id="name" name="name" className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slug">Slug (URL-friendly)</label>
          <input type="text" id="slug" name="slug" className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-input" rows={4}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary">Save Brand</button>
          <Link href="/admin/brands" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
