'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { brandSchema } from '../validations'
import { revalidatePath } from 'next/cache'

export async function getBrands() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('brands').select('*').order('name')
  if (error) throw error
  return data
}

export async function createBrand(formData: FormData) {
  const supabase = createAdminClient()
  
  const parsed = brandSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
  })

  if (!parsed.success) {
    return { error: parsed.error.format() }
  }

  const { error } = await supabase.from('brands').insert([parsed.data])
  if (error) return { error: error.message }
  
  revalidatePath('/admin/brands')
  return { success: true }
}

export async function deleteBrand(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('brands').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/brands')
  return { success: true }
}
