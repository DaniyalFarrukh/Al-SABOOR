'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { hasPermission } from './analytics'
import { productSchema, csvImportRowSchema } from '../validations'

export async function getProducts(options?: { page?: number; limit?: number; q?: string; category_id?: string }) {
  const supabase = createAdminClient()
  const page = options?.page || 1
  const limit = options?.limit || 20
  const q = options?.q || ''
  const category_id = options?.category_id || ''

  let query = supabase.from('products').select(`
    *,
    brands (name),
    categories (name),
    product_pricing (retail_price, cost_price),
    inventory (quantity)
  `, { count: 'exact' })

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
  }

  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  // Pagination (zero-indexed)
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query
  
  if (error) throw error

  return {
    data,
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function getProduct(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').select(`
    *,
    product_pricing (retail_price, cost_price),
    inventory (quantity),
    product_images (id, image_url, is_primary)
  `).eq('id', id).single()
  
  if (error) throw error
  return data
}

export async function createProduct(formData: FormData) {
  const supabase = createAdminClient()
  
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    slug: formData.get('slug'),
    category_id: formData.get('category_id') || null,
    brand_id: formData.get('brand_id') || null,
    description: formData.get('description'),
    is_active: true,
    retail_price: parseFloat(formData.get('retail_price') as string),
    retailer_price: formData.get('retailer_price') ? parseFloat(formData.get('retailer_price') as string) : null,
    cost_price: formData.get('cost_price') ? parseFloat(formData.get('cost_price') as string) : null,
    quantity: parseInt(formData.get('quantity') as string) || 0,
    seo_title: formData.get('seo_title') || undefined,
    seo_description: formData.get('seo_description') || undefined,
  })

  if (!parsed.success) {
    console.error('Validation Error:', parsed.error.format())
    return { error: parsed.error.format() }
  }

  const { 
    retail_price, 
    retailer_price,
    cost_price, 
    quantity, 
    name, 
    sku, 
    slug, 
    category_id, 
    brand_id, 
    description, 
    is_active, 
    seo_title, 
    seo_description 
  } = parsed.data

  // Insert Product
  const { data: product, error: prodErr } = await supabase.from('products').insert({
    name,
    sku,
    slug,
    category_id,
    brand_id,
    description,
    is_active,
    seo_title,
    seo_description
  }).select().single()
  if (prodErr) {
    console.error('Product Creation Error:', prodErr)
    return { error: prodErr.message }
  }

  // Insert Pricing
  if (retail_price !== undefined && retail_price !== null) {
    const { error: priceErr } = await supabase.from('product_pricing').insert({
      product_id: product.id,
      retail_price,
      retailer_price: retailer_price || null,
      cost_price: cost_price || null
    })
    if (priceErr) console.error('Price Creation Error:', priceErr)
  }

  // Insert Inventory
  const { error: invErr } = await supabase.from('inventory').insert({
    product_id: product.id,
    quantity: quantity || 0
  })
  if (invErr) console.error('Inventory Creation Error:', invErr)

  // Handle Image Uploads
  const images = formData.getAll('images') as File[];
  const uploadedUrls: string[] = [];

  for (const file of images) {
    if (file && file.size > 0 && file.name) {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${crypto.randomUUID()}.${ext}`;
      
      let { data: uploadData, error: uploadErr } = await supabase.storage
        .from('product-photos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadErr && uploadErr.message.includes('not found')) {
        console.log('Creating product-photos bucket...');
        await supabase.storage.createBucket('product-photos', { public: true });
        const retry = await supabase.storage.from('product-photos').upload(filename, file, { cacheControl: '3600', upsert: false });
        uploadData = retry.data;
        uploadErr = retry.error;
      }

      if (!uploadErr && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-photos')
          .getPublicUrl(uploadData.path);
        uploadedUrls.push(publicUrl);
      } else {
        console.error('Image upload error:', uploadErr);
      }
    }
  }

  if (uploadedUrls.length > 0) {
    const imagesToInsert = uploadedUrls.map((url, idx) => ({
      product_id: product.id,
      image_url: url,
      is_primary: idx === 0,
      display_order: idx
    }));
    const { error: imgErr } = await supabase.from('product_images').insert(imagesToInsert);
    if (imgErr) console.error('Product Images Insertion Error:', imgErr);
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin/inventory')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createAdminClient()
  
  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    slug: formData.get('slug'),
    category_id: formData.get('category_id') || null,
    brand_id: formData.get('brand_id') || null,
    description: formData.get('description'),
    is_active: formData.get('is_active') === 'true',
    retail_price: parseFloat(formData.get('retail_price') as string),
    retailer_price: formData.get('retailer_price') ? parseFloat(formData.get('retailer_price') as string) : null,
    cost_price: formData.get('cost_price') ? parseFloat(formData.get('cost_price') as string) : null,
    quantity: parseInt(formData.get('quantity') as string) || 0,
    seo_title: formData.get('seo_title') || undefined,
    seo_description: formData.get('seo_description') || undefined,
  })

  if (!parsed.success) {
    return { error: 'Validation failed. Please check your inputs.' }
  }

  const { 
    retail_price, 
    retailer_price,
    cost_price, 
    quantity, 
    name, 
    sku, 
    slug, 
    category_id, 
    brand_id, 
    description, 
    is_active, 
    seo_title, 
    seo_description 
  } = parsed.data

  const { error: prodErr } = await supabase.from('products').update({
    name,
    sku,
    slug,
    category_id,
    brand_id,
    description,
    is_active,
    seo_title,
    seo_description
  }).eq('id', id)
  if (prodErr) return { error: prodErr.message }

  if (retail_price !== undefined && retail_price !== null && !isNaN(retail_price)) {
    const { error: priceErr } = await supabase.from('product_pricing').update({
      retail_price,
      retailer_price: retailer_price || null,
      cost_price: cost_price || null
    }).eq('product_id', id)
    
    // If it doesn't exist, we might need to insert it
    if (priceErr) {
       await supabase.from('product_pricing').insert({ product_id: id, retail_price, retailer_price: retailer_price || null, cost_price: cost_price || null })
    }
  }

  const { data: invData, error: invErr } = await supabase.from('inventory').update({
    quantity: quantity || 0
  }).eq('product_id', id).select()

  if (invErr) return { error: invErr.message }
  if (!invData || invData.length === 0) {
    // Row doesn't exist, insert it
    await supabase.from('inventory').insert({
      product_id: id,
      quantity: quantity || 0
    })
  }

  // Handle Image Uploads
  const images = formData.getAll('images') as File[];
  const uploadedUrls: string[] = [];

  for (const file of images) {
    if (file && file.size > 0 && file.name) {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${crypto.randomUUID()}.${ext}`;
      
      let { data: uploadData, error: uploadErr } = await supabase.storage
        .from('product-photos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadErr && uploadErr.message.includes('not found')) {
        await supabase.storage.createBucket('product-photos', { public: true });
        const retry = await supabase.storage.from('product-photos').upload(filename, file, { cacheControl: '3600', upsert: false });
        uploadData = retry.data;
        uploadErr = retry.error;
      }

      if (!uploadErr && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-photos')
          .getPublicUrl(uploadData.path);
        uploadedUrls.push(publicUrl);
      } else {
        console.error('Image upload error:', uploadErr);
      }
    }
  }

  if (uploadedUrls.length > 0) {
    // If adding new images, we'll just append them. We can determine display_order by counting existing.
    const { count } = await supabase.from('product_images').select('*', { count: 'exact', head: true }).eq('product_id', id);
    const startIndex = count || 0;
    
    const imagesToInsert = uploadedUrls.map((url, idx) => ({
      product_id: id,
      image_url: url,
      is_primary: startIndex === 0 && idx === 0, // Set primary if it's the very first image for the product
      display_order: startIndex + idx
    }));
    const { error: imgErr } = await supabase.from('product_images').insert(imagesToInsert);
    if (imgErr) console.error('Product Images Insertion Error:', imgErr);
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin/inventory')
  return { success: true }
}

export async function deleteProduct(id: string) {
  // if (!(await hasPermission('manage_products'))) return { error: 'Forbidden' }
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}

export async function bulkImportCsvRows(rows: any[]) {
  // if (!(await hasPermission('manage_products'))) return { successful: 0, failed: 0, errors: [{ row: 0, error: 'Forbidden' }] }
  const supabase = createAdminClient()
  const results = { successful: 0, failed: 0, errors: [] as any[] }

  for (const [index, row] of rows.entries()) {
    try {
      const parsed = csvImportRowSchema.parse(row)
      
      // Attempt to resolve category and brand IDs if slugs are provided
      let category_id = null
      let brand_id = null
      
      if (parsed.CategorySlug) {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', parsed.CategorySlug).single()
        if (cat) category_id = cat.id
      }
      
      if (parsed.BrandSlug) {
        const { data: brand } = await supabase.from('brands').select('id').eq('slug', parsed.BrandSlug).single()
        if (brand) brand_id = brand.id
      }

      // Insert Product
      const { data: product, error: prodErr } = await supabase.from('products').insert({
        sku: parsed.SKU,
        name: parsed.Name,
        slug: parsed.Slug,
        category_id,
        brand_id,
      }).select().single()

      if (prodErr) throw new Error(prodErr.message)

      // Insert Pricing
      await supabase.from('product_pricing').insert({
        product_id: product.id,
        retail_price: parsed.RetailPrice
      })

      // Insert Inventory
      await supabase.from('inventory').insert({
        product_id: product.id,
        quantity: parsed.Quantity
      })

      results.successful++
    } catch (err: any) {
      results.failed++
      results.errors.push({ row: index + 1, error: err.message || err.toString() })
    }
  }
  
  revalidatePath('/admin/products')
  return results
}

export async function bulkCreateProducts(rows: { 
  sku: string; 
  name: string; 
  category: string; 
  subcategory?: string; 
  brand?: string; 
  price: number; 
  stock: number; 
  image_urls?: string 
}[]) {
  const supabase = createAdminClient()

  try {
    // 1. Gather all unique categories, subcategories, and brands
    const categoryNames = Array.from(new Set(rows.map(r => r.category).filter(Boolean)))
    const subcategoryNames = Array.from(new Set(rows.map(r => r.subcategory).filter(Boolean)))
    const allCategoryNames = Array.from(new Set([...categoryNames, ...subcategoryNames]))
    const brandNames = Array.from(new Set(rows.map(r => r.brand).filter(Boolean)))

    // 2. Fetch or create brands
    const brandMap = new Map<string, string>()
    if (brandNames.length > 0) {
      const { data: existingBrands } = await supabase.from('brands').select('id, name').in('name', brandNames)
      const existingBrandNames = (existingBrands || []).map((b: any) => b.name.toLowerCase())
      
      const missingBrands = brandNames.filter(b => b && !existingBrandNames.includes(b.toLowerCase()))
      
      if (missingBrands.length > 0) {
        const { data: newBrands } = await supabase.from('brands').insert(
          missingBrands.map(name => ({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          }))
        ).select('id, name')
        
        newBrands?.forEach(b => brandMap.set(b.name.toLowerCase(), b.id))
      }
      
      existingBrands?.forEach((b: any) => brandMap.set(b.name.toLowerCase(), b.id))
    }

    // 3. Fetch or create Categories (Top-level)
    const categoryMap = new Map<string, string>()
    if (categoryNames.length > 0) {
      const { data: existingCats } = await supabase.from('categories').select('id, name').is('parent_id', null).in('name', categoryNames)
      const existingCatNames = (existingCats || []).map((c: any) => c.name.toLowerCase())
      
      const missingCats = categoryNames.filter(c => c && !existingCatNames.includes(c.toLowerCase()))
      
      if (missingCats.length > 0) {
        const { data: newCats } = await supabase.from('categories').insert(
          missingCats.map(name => ({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            is_active: true
          }))
        ).select('id, name')
        
        newCats?.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id))
      }
      
      existingCats?.forEach((c: any) => categoryMap.set(c.name.toLowerCase(), c.id))
    }

    // 4. Fetch or create Subcategories (assuming unique names globally or under their parent)
    const subcategoryMap = new Map<string, string>()
    if (subcategoryNames.length > 0) {
      const { data: existingSubCats } = await supabase.from('categories').select('id, name, parent_id').not('parent_id', 'is', null).in('name', subcategoryNames)
      const existingSubCatNames = (existingSubCats || []).map((c: any) => c.name.toLowerCase())
      
      // We need to associate subcategories with their specified parent.
      // For simplicity in bulk, if the subcategory doesn't exist, we create it under the first row's parent that references it.
      const missingSubCats = Array.from(new Set(
        rows.filter(r => r.subcategory && !existingSubCatNames.includes(r.subcategory.toLowerCase()))
      ))

      // Keep only unique subcategory names to create
      const uniqueMissingSubCats = new Map<string, {name: string, parent_id: string}>()
      for (const row of missingSubCats) {
        if (row.subcategory && !uniqueMissingSubCats.has(row.subcategory.toLowerCase())) {
          const parent_id = categoryMap.get(row.category.toLowerCase())
          if (parent_id) {
            uniqueMissingSubCats.set(row.subcategory.toLowerCase(), { name: row.subcategory, parent_id })
          }
        }
      }

      if (uniqueMissingSubCats.size > 0) {
        const { data: newSubCats } = await supabase.from('categories').insert(
          Array.from(uniqueMissingSubCats.values()).map(sub => ({
            name: sub.name,
            slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            parent_id: sub.parent_id,
            is_active: true
          }))
        ).select('id, name')

        newSubCats?.forEach(c => subcategoryMap.set(c.name.toLowerCase(), c.id))
      }

      existingSubCats?.forEach((c: any) => subcategoryMap.set(c.name.toLowerCase(), c.id))
    }

    // 5. Insert Products
    for (const row of rows) {
      const brand_id = row.brand ? brandMap.get(row.brand.toLowerCase()) : null
      const cat_id = row.subcategory 
        ? subcategoryMap.get(row.subcategory.toLowerCase()) 
        : categoryMap.get(row.category.toLowerCase())

      // A slug is needed for product
      const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + row.sku.toLowerCase()

      const { data: product, error: prodErr } = await supabase.from('products').insert({
        sku: row.sku,
        name: row.name,
        slug,
        category_id: cat_id || null,
        brand_id: brand_id || null,
        is_active: true
      }).select('id').single()

      if (prodErr) throw new Error(`Product ${row.sku}: ${prodErr.message}`)
      
      const productId = product.id

      // Insert Pricing
      const { error: priceErr } = await supabase.from('product_pricing').insert({
        product_id: productId,
        retail_price: row.price
      })
      if (priceErr) throw new Error(`Pricing ${row.sku}: ${priceErr.message}`)

      // Insert Inventory
      const { error: invErr } = await supabase.from('inventory').insert({
        product_id: productId,
        quantity: row.stock
      })
      if (invErr) throw new Error(`Inventory ${row.sku}: ${invErr.message}`)

      // Insert Images
      if (row.image_urls) {
        const urls = row.image_urls.split(',').map(u => u.trim()).filter(Boolean)
        if (urls.length > 0) {
          const imagePayload = urls.map((url, idx) => ({
            product_id: productId,
            image_url: url,
            display_order: idx,
            is_primary: idx === 0
          }))
          await supabase.from('product_images').insert(imagePayload)
        }
      }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || err.toString() }
  }
}

export async function uploadProductImage(productId: string, formData: FormData) {
  const supabase = createAdminClient()
  const file = formData.get('file') as File
  if (!file || !(file instanceof File)) {
    return { error: 'No file provided' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}/${crypto.randomUUID()}.${fileExt}`

  // Upload to Storage
  let { error: uploadError } = await supabase.storage
    .from('product-photos')
    .upload(fileName, file, { upsert: false })

  if (uploadError && uploadError.message.includes('not found')) {
    await supabase.storage.createBucket('product-photos', { public: true });
    const retry = await supabase.storage.from('product-photos').upload(fileName, file, { upsert: false });
    uploadError = retry.error;
  }

  if (uploadError) {
    return { error: 'Storage error: ' + uploadError.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-photos')
    .getPublicUrl(fileName)

  // Insert into DB
  const { error: dbError } = await supabase.from('product_images').insert({
    product_id: productId,
    image_url: publicUrl,
    is_primary: false // User can potentially set primary later, default false or based on existing images
  })

  if (dbError) {
    return { error: 'DB error: ' + dbError.message }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function deleteProductImage(imageId: string, imageUrl: string, productId: string) {
  const supabase = createAdminClient()

  // Extract filename from URL
  const urlParts = imageUrl.split('/product-photos/')
  if (urlParts.length === 2) {
    const filePath = urlParts[1]
    
    // Remove from storage
    const { error: storageError } = await supabase.storage
      .from('product-photos')
      .remove([filePath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue to delete from DB even if storage deletion fails (e.g., file not found)
    }
  }

  // Delete from DB
  const { error: dbError } = await supabase.from('product_images').delete().eq('id', imageId)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

export async function uploadBulkImages(formData: FormData) {
  const supabase = createAdminClient()
  const files = formData.getAll('files') as File[]
  const uploadedUrls: { filename: string, url: string }[] = []

  for (const file of files) {
    if (file && file.size > 0 && file.name) {
      // Keep original filename structure but sanitize
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
      const fileName = `bulk/${crypto.randomUUID()}_${safeName}`
      
      let { data: uploadData, error: uploadErr } = await supabase.storage
        .from('product-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
        
      if (uploadErr && uploadErr.message.includes('not found')) {
        await supabase.storage.createBucket('product-photos', { public: true });
        const retry = await supabase.storage.from('product-photos').upload(fileName, file, { upsert: false });
        uploadData = retry.data;
        uploadErr = retry.error;
      }

      if (!uploadErr && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-photos')
          .getPublicUrl(uploadData.path)
        
        uploadedUrls.push({
          filename: file.name, // Return original name so frontend can match with SKU
          url: publicUrl
        })
      } else {
        console.error('Bulk image upload error for', file.name, ':', uploadErr)
      }
    }
  }

  return { uploadedUrls }
}
