'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { hasPermission } from './analytics'

export async function getStoreSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('store_settings').select('*').single()
  
  if (error) {
    // Silently return null on any error (including fetch failed / offline) 
    // Layout will gracefully fallback to default settings.
    return null
  }
  
  return data
}

export async function updateStoreSettings(section: string, data: any) {
  if (!(await hasPermission('manage_settings'))) return { error: 'Forbidden: You lack permission to manage store settings.' }
  
  const supabase = await createClient()
  
  // Since we only have one row, we can just update it without a WHERE clause (or WHERE true, but Supabase requires a filter)
  // We'll fetch the ID first
  const { data: current } = await supabase.from('store_settings').select('id').single()
  
  if (!current) {
    // If somehow the row doesn't exist, insert it
    const payload: any = {}
    payload[section] = data
    await supabase.from('store_settings').insert(payload)
  } else {
    // Update existing row
    const payload: any = {}
    payload[section] = data
    const { error } = await supabase.from('store_settings').update(payload).eq('id', current.id)
    if (error) return { error: error.message }
  }

  revalidatePath('/', 'layout') // Revalidate everything since settings affect global layouts
  return { success: true }
}
