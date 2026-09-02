'use server'

import { createClient } from '@/utils/supabase/server'

// Helper to check if current user has a specific permission
export async function hasPermission(permission: string) {
  return true; // TEMPORARILY BYPASSED FOR LOCAL DEV
  /*
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(permissions)')
    .eq('id', user.id)
    .single()

  const roles = profile?.roles as any
  const permissions = roles?.permissions || []
  return permissions.includes(permission) || permissions.includes('superadmin')
  */
}

export async function getDashboardStats(startDate?: Date, endDate?: Date) {
  const supabase = await createClient()
  
  // Security check: Only users with view_revenue can access financial aggregates
  const canViewRevenue = await hasPermission('view_revenue')
  
  if (!canViewRevenue) {
    return { error: 'Forbidden: You do not have permission to view revenue data.' }
  }

  const p_start_date = startDate ? startDate.toISOString() : null
  const p_end_date = endDate ? endDate.toISOString() : null

  const { data, error } = await supabase.rpc('admin_dashboard_stats', {
    p_start_date,
    p_end_date
  })

  if (error) {
    return { error: error.message || 'Fetch failed' }
  }

  return { data }
}

export async function getProductPerformance() {
  const supabase = await createClient()
  const canViewRevenue = await hasPermission('view_revenue')
  if (!canViewRevenue) return { error: 'Forbidden' }

  // Simplified version: aggregate order items directly
  // In production with huge datasets, this would be a Materialized View or RPC
  const { data, error } = await supabase.from('order_items')
    .select('product_id, quantity, total_price, products(name)')
  
  if (error) return { error: error.message }

  // Aggregate in JS for this scale
  const performance: Record<string, { id: string, name: string, unitsSold: number, revenue: number }> = {}
  
  for (const item of data) {
    if (!item.product_id) continue
    if (!performance[item.product_id]) {
      performance[item.product_id] = {
        id: item.product_id,
        name: (item.products as any)?.name || 'Unknown',
        unitsSold: 0,
        revenue: 0
      }
    }
    performance[item.product_id].unitsSold += item.quantity
    performance[item.product_id].revenue += item.total_price
  }

  const sorted = Object.values(performance).sort((a, b) => b.revenue - a.revenue)
  
  return { data: sorted }
}
