'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { CODPaymentProvider } from '../providers/payment/PaymentProvider'

// Simulated webhook endpoint for handling payment success
export async function handlePaymentWebhook(payload: any) {
  const supabase = await createClient()
  
  const { orderId, amount, transactionRef, idempotencyKey, provider } = payload

  // 1. Verify idempotency
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .single()

  if (existingPayment) {
    console.log(`[Webhook] Duplicate request dropped for key: ${idempotencyKey}`)
    return { success: true, message: 'Already processed' }
  }

  // 2. Insert Payment
  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      provider: provider,
      amount: amount,
      status: 'paid',
      transaction_reference: transactionRef,
      idempotency_key: idempotencyKey
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'Database error' }
  }

  // 3. Update Order Status
  await supabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', orderId)

  // 4. Log History
  await supabase.from('order_history').insert({
    order_id: orderId,
    status: 'confirmed',
    notes: `Payment confirmed via ${provider} webhook.`
  })

  return { success: true }
}

export async function processRefund(paymentId: string, amount: number, reason: string) {
  const supabase = await createClient()
  
  // Create refund record (DB trigger validates amount)
  const { error: refundError } = await supabase
    .from('refunds')
    .insert({
      payment_id: paymentId,
      order_id: (await supabase.from('payments').select('order_id').eq('id', paymentId).single()).data?.order_id,
      amount,
      reason,
      status: 'pending' // Pending until provider confirms
    })

  if (refundError) {
    return { success: false, error: refundError.message }
  }

  // In a real app, call PaymentProvider.processRefund here
  
  revalidatePath('/admin/orders')
  return { success: true }
}
