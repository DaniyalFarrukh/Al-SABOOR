import { getCategories } from '@/lib/actions/categories'
import { getBrands } from '@/lib/actions/brands'
import { getProduct, updateProduct, uploadProductImage, deleteProductImage } from '@/lib/actions/products'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Trash2, Upload } from 'lucide-react'

import CategoryCombobox from '../CategoryCombobox'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  const [product, categories, brands] = await Promise.all([
    getProduct(params.id),
    getCategories(),
    getBrands()
  ])

  async function action(formData: FormData) {
    'use server'
    const res = await updateProduct(params.id, formData)
    if (res?.error) {
      throw new Error(JSON.stringify(res.error, null, 2))
    }
    if (res?.success) {
      redirect('/admin/products')
    }
  }

  const retailPrice = product.product_pricing?.[0]?.retail_price || ''
  const retailerPrice = product.product_pricing?.[0]?.retailer_price || ''
  const costPrice = product.product_pricing?.[0]?.cost_price || ''
  const quantity = product.inventory?.[0]?.quantity || 0

  return (
    <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-header">
        <h1 className="admin-title">Edit Product: {product.name}</h1>
      </div>
      
      <form action={action}>
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Product Name</label>
            <input type="text" id="name" name="name" className="form-input" defaultValue={product.name} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sku">SKU</label>
            <input type="text" id="sku" name="sku" className="form-input" defaultValue={product.sku} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slug">Slug (URL-friendly)</label>
          <input type="text" id="slug" name="slug" className="form-input" defaultValue={product.slug} required />
        </div>

        <CategoryCombobox categories={categories || []} defaultValue={product.category_id || undefined} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="brand_id">Brand</label>
            <select id="brand_id" name="brand_id" className="form-input" defaultValue={product.brand_id || ''}>
              <option value="">Select Brand...</option>
              {brands?.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-input" rows={5} defaultValue={product.description || ''}></textarea>
        </div>
        
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="is_active" name="is_active" value="true" defaultChecked={product.is_active} style={{ width: '1.25rem', height: '1.25rem' }} />
          <label htmlFor="is_active" style={{ fontWeight: 500 }}>Active (Visible on Storefront)</label>
        </div>

        {/* Pricing & Inventory */}
        <h3 style={{ fontSize: '1.125rem', margin: '2rem 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>Pricing & Inventory</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="retail_price">Retail Price (Rs.)</label>
            <input type="number" id="retail_price" name="retail_price" className="form-input" required min="0" step="0.01" defaultValue={retailPrice} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="retailer_price">Retailer Price (Rs.)</label>
            <input type="number" id="retailer_price" name="retailer_price" className="form-input" min="0" step="0.01" defaultValue={retailerPrice || ''} placeholder="Optional Wholesale" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cost_price">Cost Price (Rs.)</label>
            <input type="number" id="cost_price" name="cost_price" className="form-input" min="0" step="0.01" defaultValue={costPrice} />
          </div>
        </div>
        
        <div className="form-group" style={{ maxWidth: '33%' }}>
          <label className="form-label" htmlFor="quantity">Stock</label>
          <input type="number" id="quantity" name="quantity" className="form-input" min="0" defaultValue={quantity} />
        </div>

        {/* SEO */}
        <h3 style={{ fontSize: '1.125rem', margin: '2rem 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>SEO Optimization</h3>
        
        <div className="form-group">
          <label className="form-label" htmlFor="seo_title">SEO Title</label>
          <input type="text" id="seo_title" name="seo_title" className="form-input" defaultValue={product.seo_title || ''} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="seo_description">Meta Description</label>
          <textarea id="seo_description" name="seo_description" className="form-input" rows={2} defaultValue={product.seo_description || ''}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary">Save Changes</button>
          <Link href="/admin/products" className="btn-secondary">Cancel</Link>
        </div>
      </form>

      {/* Product Images Section */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Product Images</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {product.product_images?.map((img: any) => (
            <div key={img.id} style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="Product Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <form action={async () => {
                'use server'
                await deleteProductImage(img.id, img.image_url, params.id)
              }} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                <button type="submit" className="btn-danger" style={{ padding: '0.25rem' }} title="Delete Image">
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          ))}
          {(!product.product_images || product.product_images.length === 0) && (
            <div style={{ gridColumn: '1 / -1', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
              No images uploaded yet.
            </div>
          )}
        </div>

        <form action={async (formData) => {
          'use server'
          await uploadProductImage(params.id, formData)
        }} style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', backgroundColor: 'var(--muted)', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="file">Upload New Image</label>
            <input type="file" id="file" name="file" accept="image/*" className="form-input" required style={{ backgroundColor: 'var(--background)' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={16} /> Upload
          </button>
        </form>
      </div>
    </div>
  )
}
