import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }
  ]

  // Add Products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  if (products) {
    products.forEach((product) => {
      sitemapEntries.push({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })
  }

  // Add Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')

  if (categories) {
    categories.forEach((category) => {
      sitemapEntries.push({
        url: `${baseUrl}/products?category=${category.slug}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  }

  // Add Static Policies
  const policies = ['shipping-policy', 'return-policy', 'refund-policy', 'privacy-policy', 'terms-of-service']
  policies.forEach((policy) => {
    sitemapEntries.push({
      url: `${baseUrl}/policies/${policy}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  })

  return sitemapEntries
}
