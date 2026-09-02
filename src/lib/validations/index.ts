import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true)
})

export const brandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional()
})

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new variants
  sku: z.string().min(3, 'Variant SKU is required'),
  name: z.string().min(1, 'Variant name is required'),
  price_override: z.number().optional().nullable(),
  options: z.any().optional().nullable(),
  is_active: z.boolean().default(true)
})

export const productSpecificationSchema = z.object({
  spec_key: z.string().min(1, 'Key is required'),
  spec_value: z.string().min(1, 'Value is required'),
  display_order: z.number().default(0)
})

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required'),
  sku: z.string().min(3, 'SKU is required'),
  brand_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  description: z.string().optional(),
  condition: z.string().default('new'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  
  // Pricing
  retail_price: z.number().min(0, 'Price must be positive'),
  retailer_price: z.number().optional().nullable(),
  cost_price: z.number().optional().nullable(),
  sale_price: z.number().optional().nullable(),
  
  // Inventory
  quantity: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).default(5),

  // Relations
  variants: z.array(productVariantSchema).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
})

export const csvImportRowSchema = z.object({
  SKU: z.string().min(1, "SKU is required"),
  Name: z.string().min(1, "Name is required"),
  Slug: z.string().min(1, "Slug is required"),
  RetailPrice: z.coerce.number().min(0, "Invalid retail price"),
  CategorySlug: z.string().optional(),
  BrandSlug: z.string().optional(),
  Quantity: z.coerce.number().int().min(0).default(0)
})
