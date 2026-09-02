'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// -- COUPONS --

export async function createCoupon(formData: FormData) {
  const supabase = await createClient()

  const code = formData.get('code') as string
  const discountType = formData.get('discount_type') as 'flat' | 'percentage'
  const discountValue = parseFloat(formData.get('discount_value') as string)
  const minOrderValue = formData.get('min_order_value') ? parseFloat(formData.get('min_order_value') as string) : null
  const maxDiscount = formData.get('max_discount') ? parseFloat(formData.get('max_discount') as string) : null
  const usageLimit = formData.get('usage_limit') ? parseInt(formData.get('usage_limit') as string) : null
  
  const { error } = await supabase.from('coupons').insert({
    code: code.toUpperCase(),
    discount_type: discountType,
    discount_value: discountValue,
    min_order_value: minOrderValue,
    max_discount: maxDiscount,
    usage_limit: usageLimit,
    is_active: true
  })

  if (error) return { error: error.message }
  
  revalidatePath('/admin/marketing/coupons')
  return { success: true }
}

export async function toggleCouponStatus(couponId: string, currentStatus: boolean) {
  const supabase = await createClient()
  await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', couponId)
  revalidatePath('/admin/marketing/coupons')
}

// -- VALIDATE COUPON FOR CHECKOUT UI --
export async function validateCouponCode(code: string, subtotal: number) {
  const supabase = await createClient()
  
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) return { error: 'Invalid or expired coupon' }

  if (coupon.start_date && new Date() < new Date(coupon.start_date)) return { error: 'Coupon not active yet' }
  if (coupon.end_date && new Date() > new Date(coupon.end_date)) return { error: 'Coupon expired' }
  
  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return { error: `Minimum order value of Rs. ${coupon.min_order_value} required` }
  }

  // Calculate discount for UI
  let discount = 0
  if (coupon.discount_type === 'flat') {
    discount = coupon.discount_value
  } else {
    discount = subtotal * (coupon.discount_value / 100)
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount
    }
  }

  return { success: true, discount, type: coupon.discount_type, code: coupon.code }
}
