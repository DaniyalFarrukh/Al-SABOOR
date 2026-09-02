'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getCustomers(searchQuery?: string, filterByRole: 'customer' | 'wholesaler' | 'all' = 'customer') {
  const adminClient = createAdminClient()
  
  let query = adminClient.from('profiles').select(`
    id,
    first_name,
    last_name,
    phone,
    phone,
    is_blocked,
    is_approved,
    created_at,
    role_id,
    roles ( name ),
    orders ( id, grand_total, status )
  `)

  if (searchQuery) {
    query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query
  
  if (error) {
    return []
  }  

  // Calculate total spent for each customer (only for non-cancelled/returned orders)
  let filteredData = data;
  
  if (filterByRole === 'customer') {
    filteredData = data.filter(p => !p.roles || ((p.roles as any).name !== 'Retailer' && (p.roles as any).name !== 'Wholesaler'));
  } else if (filterByRole === 'wholesaler') {
    filteredData = data.filter(p => p.roles && ((p.roles as any).name === 'Retailer' || (p.roles as any).name === 'Wholesaler') && p.is_approved);
  }

  return filteredData.map(profile => {
    const validOrders = profile.orders.filter(o => o.status !== 'cancelled' && o.status !== 'returned')
    const totalSpent = validOrders.reduce((sum, order) => sum + order.grand_total, 0)
    const orderCount = profile.orders.length
    
    return {
      ...profile,
      totalSpent,
      orderCount
    }
  }).sort((a, b) => b.totalSpent - a.totalSpent)
}

export async function getCustomerDetails(id: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  
  const { data: orders } = await supabase.from('orders')
    .select('*, order_items(*, products(name))')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase.from('reviews')
    .select('*, products(name)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  return { profile, orders, reviews }
}

export async function updateCustomerNotes(id: string, notes: string) {
  const supabase = await createClient()
  await supabase.from('profiles').update({ admin_notes: notes }).eq('id', id)
  revalidatePath(`/admin/customers/${id}`)
}

export async function toggleCustomerBlock(id: string, isBlocked: boolean) {
  const supabase = await createClient()
  await supabase.from('profiles').update({ is_blocked: !isBlocked }).eq('id', id)
  revalidatePath(`/admin/customers/${id}`)
  revalidatePath('/admin/customers')
}

export async function getRetailers() {
  const adminClient = createAdminClient()
  
  // Find the retailer role id
  const { data: roleData } = await adminClient.from('roles').select('id').eq('name', 'Retailer').single()
  
  if (!roleData) return []

  const { data, error } = await adminClient.from('profiles').select(`
    id,
    first_name,
    last_name,
    phone,
    is_approved,
    created_at
  `).eq('role_id', roleData.id).order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching retailers:", JSON.stringify(error))
    return []
  }
  
  // Fetch emails from auth.users using admin api
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()
  
  if (authError) {
    console.error("Error fetching auth users:", JSON.stringify(authError))
    return data
  }
  
  const users = authData.users || []
  
  return data.map((retailer: any) => {
    const authUser = users.find(u => u.id === retailer.id)
    return {
      ...retailer,
      auth_users: { email: authUser?.email || 'N/A' }
    }
  })
}

export async function toggleRetailerApproval(id: string, currentStatus: boolean) {
  const adminClient = createAdminClient()
  await adminClient.from('profiles').update({ is_approved: !currentStatus }).eq('id', id)
  revalidatePath('/admin/retailers')
}
