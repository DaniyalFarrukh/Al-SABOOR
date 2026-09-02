'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// -- REVIEWS (CUSTOMER SIDE) --

export async function submitReview(productId: string, rating: number, comment: string, title?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to review.' }

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
    title,
    status: 'approved' // Auto-approve per policy
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/product/[slug]`, 'page')
  return { success: true }
}

// -- REVIEWS (ADMIN SIDE) --

export async function getAdminReviews() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, products(name), profiles(first_name, last_name, email)')
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function moderateReview(reviewId: string, action: 'approve' | 'reject' | 'delete') {
  const supabase = await createClient()
  
  if (action === 'delete') {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
    if (error) return { error: error.message }
  } else {
    const status = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/reviews')
  return { success: true }
}
