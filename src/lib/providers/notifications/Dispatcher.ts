import { createClient } from '@/utils/supabase/server'
import { EmailProvider } from './EmailProvider'
import { WhatsAppProvider } from './WhatsAppProvider'

type EventContext = {
  order_id?: string;
  user_id?: string;
  variables: Record<string, string>;
  customer_phone?: string;
  customer_email?: string;
}

export class NotificationDispatcher {
  private emailProvider = new EmailProvider()
  private whatsappProvider = new WhatsAppProvider()

  /**
   * Dispatch a business event (e.g., 'order_shipped').
   * It looks up active templates in the DB and routes them to the correct providers.
   */
  async dispatch(eventType: string, context: EventContext) {
    const supabase = await createClient()

    // 1. Find active templates for this event
    const { data: templates } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('type', eventType)
      .eq('is_active', true)

    if (!templates || templates.length === 0) return

    for (const template of templates) {
      let finalBody = template.body_template
      let finalSubject = template.subject || ''

      // Replace variables in template
      for (const [key, value] of Object.entries(context.variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        finalBody = finalBody.replace(regex, value)
        finalSubject = finalSubject.replace(regex, value)
      }

      // Log notification as pending in DB
      const { data: notif } = await supabase.from('notifications').insert({
        type: eventType,
        channel: template.channel,
        user_id: context.user_id || null,
        order_id: context.order_id || null,
        status: 'pending',
        payload: { body: finalBody, subject: finalSubject, variables: context.variables }
      }).select().single()

      if (!notif) continue

      let success = false
      let errorMessage = null

      try {
        // Route to specific provider
        if (template.channel === 'email' && context.customer_email) {
          const res = await this.emailProvider.sendEmail(context.customer_email, finalSubject, finalBody)
          success = res.success
        } 
        else if (template.channel === 'whatsapp' && context.customer_phone) {
          // Format phone number to international format dynamically here
          const formattedPhone = context.customer_phone.replace(/\D/g,'')
          
          // Using text message for simplicity in mock, production would map to template IDs
          const res = await this.whatsappProvider.sendTextMessage(formattedPhone, finalBody)
          success = res.success
        }
      } catch (err: any) {
        success = false
        errorMessage = err.message
      }

      // Update notification status
      await supabase.from('notifications').update({
        status: success ? 'sent' : 'failed',
        error_message: errorMessage,
        sent_at: success ? new Date().toISOString() : null
      }).eq('id', notif.id)
    }
  }
}
