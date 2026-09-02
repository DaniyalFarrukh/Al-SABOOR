'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { categorySchema } from '../validations'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function createCategory(formData: FormData) {
  const supabase = createAdminClient()
  
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    parent_id: formData.get('parent_id') || null,
    is_active: formData.get('is_active') === 'true'
  })

  if (!parsed.success) {
    return { error: parsed.error.format() }
  }

  const { error } = await supabase.from('categories').insert([parsed.data])
  if (error) return { error: error.message }
  
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    console.error('Delete Category Error:', error)
    return { error: error.message }
  }
  revalidatePath('/admin/categories')
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function getCategory(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createAdminClient()
  
  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    parent_id: formData.get('parent_id') || null,
    is_active: formData.get('is_active') === 'true'
  })

  if (!parsed.success) {
    return { error: parsed.error.format() }
  }

  const { error } = await supabase.from('categories').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function bulkCreateCategories(rows: { name: string; slug: string; parent_category?: string }[]) {
  const supabase = createAdminClient()

  // Find all unique parent category names
  const parentNames = Array.from(new Set(rows.map(r => r.parent_category).filter(Boolean) as string[]))

  // Find existing parents
  let existingParents: any[] = []
  if (parentNames.length > 0) {
    const { data: existingData } = await supabase
      .from('categories')
      .select('id, name')
      .in('name', parentNames)
    existingParents = existingData || []
  }

  // Create missing parents
  const missingParents = parentNames.filter(name => !existingParents.some(p => p.name.toLowerCase() === name.toLowerCase()))
  const newParentsMap = new Map<string, string>()

  if (missingParents.length > 0) {
    const newParentsData = missingParents.map(name => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      is_active: true
    }))

    const { data: insertedParents, error: parentError } = await supabase
      .from('categories')
      .insert(newParentsData)
      .select('id, name')

    if (parentError) return { error: 'Failed to create missing parent categories: ' + parentError.message }

    insertedParents?.forEach(p => {
      newParentsMap.set(p.name.toLowerCase(), p.id)
    })
  }

  // Map to new IDs
  existingParents.forEach(p => {
    newParentsMap.set(p.name.toLowerCase(), p.id)
  })

  // Prepare final categories insert payload
  const insertPayload = rows.map(r => {
    let parent_id = null
    if (r.parent_category) {
      parent_id = newParentsMap.get(r.parent_category.toLowerCase()) || null
    }

    return {
      name: r.name,
      slug: r.slug,
      parent_id,
      is_active: true
    }
  })

  const { error } = await supabase.from('categories').insert(insertPayload)
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function createCategoryInline(name: string, parent_id?: string) {
  const supabase = createAdminClient()
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  
  const { data, error } = await supabase.from('categories').insert({
    name,
    slug,
    parent_id: parent_id || null,
    is_active: true
  }).select('id, name, parent_id').single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}
