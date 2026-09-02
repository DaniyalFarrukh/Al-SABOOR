import { getCategories } from '@/lib/actions/categories'
import { getBrands } from '@/lib/actions/brands'
import { createProduct } from '@/lib/actions/products'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import CategoryCombobox from '../CategoryCombobox'

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands()
  ])

  async function action(formData: FormData) {
    'use server'
    const res = await createProduct(formData)
    if (res?.error) {
      throw new Error(JSON.stringify(res.error, null, 2))
    }
    if (res?.success) {
      redirect('/admin/products')
    }
  }

  return (
    <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-header">
        <h1 className="admin-title">Create Product</h1>
      </div>
      
      <form action={action}>
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Product Name</label>
            <input type="text" id="name" name="name" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sku">SKU</label>
            <input type="text" id="sku" name="sku" className="form-input" required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slug">Slug (URL-friendly)</label>
          <input type="text" id="slug" name="slug" className="form-input" required />
        </div>

        <CategoryCombobox categories={categories || []} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="brand_id">Brand</label>
            <select id="brand_id" name="brand_id" className="form-input">
              <option value="">Select Brand...</option>
              {brands?.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-input" rows={5}></textarea>
        </div>

        {/* Images */}
        <h3 style={{ fontSize: '1.125rem', margin: '2rem 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Product Images</h3>
        
        <div className="form-group">
          <label className="form-label" htmlFor="images">Upload Photos</label>
          <input type="file" id="images" name="images" className="form-input" accept="image/*" multiple style={{ padding: '0.5rem' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>You can select multiple images. The first image will be the primary one.</p>
        </div>

        {/* Pricing & Inventory */}
        <h3 style={{ fontSize: '1.125rem', margin: '2rem 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Pricing & Inventory</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="retail_price">Retail Price (Rs.)</label>
            <input type="number" id="retail_price" name="retail_price" className="form-input" required min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="retailer_price">Retailer Price (Rs.)</label>
            <input type="number" id="retailer_price" name="retailer_price" className="form-input" min="0" step="0.01" placeholder="Optional Wholesale" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cost_price">Cost Price (Rs.)</label>
            <input type="number" id="cost_price" name="cost_price" className="form-input" min="0" step="0.01" />
          </div>
        </div>
        
        <div className="form-group" style={{ maxWidth: '33%' }}>
          <label className="form-label" htmlFor="quantity">Initial Stock</label>
          <input type="number" id="quantity" name="quantity" className="form-input" defaultValue="0" min="0" />
        </div>

        {/* SEO */}
        <h3 style={{ fontSize: '1.125rem', margin: '2rem 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>SEO Optimization</h3>
        
        <div className="form-group">
          <label className="form-label" htmlFor="seo_title">SEO Title</label>
          <input type="text" id="seo_title" name="seo_title" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="seo_description">Meta Description</label>
          <textarea id="seo_description" name="seo_description" className="form-input" rows={2}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary">Save Product</button>
          <Link href="/admin/products" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
