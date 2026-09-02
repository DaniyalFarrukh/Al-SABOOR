'use server'

import { createClient } from '@/utils/supabase/server'

import { unstable_cache } from 'next/cache'
import { createClient as createPublicClient } from '@supabase/supabase-js'

// -----------------------------------------------------------------------------
// Homepage Actions
// -----------------------------------------------------------------------------

export async function getHomepageData() {
  const cachedFetch = unstable_cache(
    async () => {
      // Use a pure public client to avoid Next.js throwing cookie() dynamic rendering bailouts during caching
      const supabase = createPublicClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

  // Run all queries concurrently to improve performance (and reduce timeout delays when DB is offline)
  const [featuredResponse, flashSalesResponse, categoriesResponse, latestProductsResponse] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, name, slug, brand_id, category_id, is_featured,
        brands (name),
        categories (name),
        product_pricing (retail_price, sale_price, retailer_price, is_flash_sale),
        product_images (image_url, is_primary)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(8),
    
    supabase
      .from('products')
      .select(`
        id, name, slug, brand_id, category_id,
        brands (name),
        categories (name),
        product_pricing!inner (retail_price, sale_price, retailer_price, is_flash_sale),
        product_images (image_url, is_primary)
      `)
      .eq('is_active', true)
      .eq('product_pricing.is_flash_sale', true)
      .limit(8),

    supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .eq('is_active', true)
      .is('parent_id', null)
      .limit(12),
      
    supabase
      .from('products')
      .select(`
        id, name, slug, brand_id, category_id,
        brands (name),
        categories (name, slug),
        product_pricing (retail_price, sale_price, retailer_price, is_flash_sale),
        product_images (image_url, is_primary)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)
  ])

      return {
        featured: featuredResponse.data || [],
        flashSales: flashSalesResponse.data || [],
        categories: categoriesResponse.data || [],
        latestProducts: latestProductsResponse.data || []
      }
    },
    ['homepage-data'],
    { revalidate: 60, tags: ['homepage-data'] }
  )

  return cachedFetch()
}

// -----------------------------------------------------------------------------
// Catalog / Search Actions
// -----------------------------------------------------------------------------

const getCachedMetadata = unstable_cache(
  async () => {
    const publicSupabase = createPublicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const [cats, brands] = await Promise.all([
      publicSupabase.from('categories').select('id, name, parent_id, slug'),
      publicSupabase.from('brands').select('id, name, slug')
    ])
    return { cats: cats.data || [], brands: brands.data || [] }
  },
  ['storefront-metadata'],
  { revalidate: 300, tags: ['storefront-metadata'] }
)

export async function searchProducts(params: {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
}) {
  const supabase = await createClient()
  const limit = 24
  const page = params.page || 1
  const from = (page - 1) * limit
  const to = from + limit - 1

  const categoryJoin = params.category ? 'categories!inner' : 'categories'
  const brandJoin = params.brand ? 'brands!inner' : 'brands'

  let query = supabase
    .from('products')
    .select(`
      id, name, slug, sku,
      ${brandJoin} (name, slug),
      ${categoryJoin} (name, slug),
      product_pricing (retail_price, sale_price, retailer_price),
      product_images (image_url, is_primary)
    `, { count: 'exact' })
    .eq('is_active', true)

  // Text Search
  if (params.q) {
    const safeQ = params.q.replace(/,/g, ' ').trim()
    const lowerQ = safeQ.toLowerCase()
    
    // Fetch all categories and brands to resolve subcategories and fuzzy matches
    const { cats: allCats, brands: allBrands } = await getCachedMetadata()
    
    // Find matching brands
    const brandIds = allBrands.filter(b => b.name.toLowerCase().includes(lowerQ)).map(b => b.id) || []

    // Find matching categories and resolve ALL their subcategories
    const matchedCatIds = new Set<string>(
      allCats.filter(c => c.name.toLowerCase().includes(lowerQ)).map(c => c.id)
    )
    
    // Recursively add child categories (e.g. searching "Engine Oil" includes "10W-40" subcategories)
    let added = true
    while (added) {
      added = false
      for (const c of allCats) {
        if (c.parent_id && matchedCatIds.has(c.parent_id) && !matchedCatIds.has(c.id)) {
          matchedCatIds.add(c.id)
          added = true
        }
      }
    }
    const categoryIds = Array.from(matchedCatIds)

    // Build advanced OR filter string for PostgREST
    const qStr = `%${safeQ}%`
    let orFilters = `name.ilike.${qStr},description.ilike.${qStr}`
    
    if (categoryIds.length > 0) {
      orFilters += `,category_id.in.(${categoryIds.join(',')})`
    }
    if (brandIds.length > 0) {
      orFilters += `,brand_id.in.(${brandIds.join(',')})`
    }
    
    // Multi-word matching (AND condition inside OR)
    const terms = safeQ.split(/\s+/).filter(t => t.length > 1)
    if (terms.length > 1) {
      const andConditions = terms.map(t => `name.ilike.%${t}%`).join(',')
      orFilters += `,and(${andConditions})`
    }

    query = query.or(orFilters)
  }

  // Category Filter
  if (params.category) {
    // Fetch all categories to resolve subcategories for the filter
    const { cats: allCategories } = await getCachedMetadata()
    
    if (allCategories && allCategories.length > 0) {
      const targetCategory = allCategories.find(c => c.slug === params.category)
      
      if (targetCategory) {
        const categoryIds = new Set<string>([targetCategory.id])
        
        // Recursively add all child category IDs
        let added = true
        while (added) {
          added = false
          for (const c of allCategories) {
            if (c.parent_id && categoryIds.has(c.parent_id) && !categoryIds.has(c.id)) {
              categoryIds.add(c.id)
              added = true
            }
          }
        }
        
        // Filter by any of the resolved category IDs
        query = query.in('category_id', Array.from(categoryIds))
      } else {
        // Fallback to strict slug match if not found in memory
        query = query.eq('categories.slug', params.category)
      }
    } else {
      query = query.eq('categories.slug', params.category)
    }
  }

  // Brand Filter
  if (params.brand) {
    query = query.eq('brands.slug', params.brand)
  }
  
  // Price Filters (Need to filter on the joined table)
  if (params.minPrice) {
    query = query.gte('product_pricing.retail_price', parseInt(params.minPrice))
  }
  if (params.maxPrice) {
    query = query.lte('product_pricing.retail_price', parseInt(params.maxPrice))
  }

  // Sorting
  switch (params.sort) {
    case 'price_asc':
      // Supabase has limited support for ordering by related tables in JS client.
      // Ideally handled via a database View or RPC.
      // For now, we will sort natively on the client or by a view if available.
      // We will skip native relation sort in JS and fallback to default or require RPC.
      break;
    case 'price_desc':
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break;
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to);
  console.log('searchProducts debug:', { count, dataLength: data?.length, error });

  if (error) {
    // Silently handle fetch failures
    return { data: [], count: 0, error: error.message || 'Fetch failed' }
  }

  // Handle post-query sorting if needed for relations
  let processedData = data as any[]
  if (params.sort === 'price_asc') {
    processedData.sort((a, b) => (a.product_pricing[0]?.sale_price || a.product_pricing[0]?.retail_price || 0) - (b.product_pricing[0]?.sale_price || b.product_pricing[0]?.retail_price || 0))
  } else if (params.sort === 'price_desc') {
    processedData.sort((a, b) => (b.product_pricing[0]?.sale_price || b.product_pricing[0]?.retail_price || 0) - (a.product_pricing[0]?.sale_price || a.product_pricing[0]?.retail_price || 0))
  }

  return { data: processedData, count: count || 0, totalPages: count ? Math.ceil(count / limit) : 0 }
}

// -----------------------------------------------------------------------------
// Product Detail Page
// -----------------------------------------------------------------------------

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { createAdminClient } = await import('@/utils/supabase/admin')

  console.log('getProductBySlug - incoming slug:', slug);
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brands (name, slug),
      categories (name, slug),
      product_pricing (*),
      product_images (*),
      product_variants (*),
      product_specifications (*),
      reviews(*, profiles(first_name, last_name))
    `)
    .ilike('slug', slug.trim())
    .eq('is_active', true)
    .single();
    
  if (error) {
    console.log('getProductBySlug - query error:', error);
    return { error: error.message };
  }

  // Fetch inventory using admin client because public RLS might block it
  const adminClient = createAdminClient()
  const { data: inventoryData } = await adminClient
    .from('inventory')
    .select('quantity')
    .eq('product_id', data.id)
    
  data.inventory = inventoryData || []
  
  console.log('getProductBySlug - query result:', { data, error });
  return { data };
}

