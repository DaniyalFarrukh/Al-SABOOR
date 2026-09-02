/**
 * WhatsAppProvider
 * 
 * Abstraction for Official Meta WhatsApp Cloud API.
 * As per architectural guidelines:
 * - NO scraping.
 * - NO personal WhatsApp automation.
 * - Strictly uses official Meta templates and APIs.
 */

export class WhatsAppProvider {
  private apiUrl: string
  private token: string
  private phoneNumberId: string

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0'
    this.token = process.env.WHATSAPP_ACCESS_TOKEN || 'MOCK_TOKEN'
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || 'MOCK_PHONE_ID'
  }

  /**
   * Sends an approved WhatsApp Template Message (required to initiate conversation outside 24h window).
   */
  async sendTemplateMessage(to: string, templateName: string, components: any[]) {
    console.log(`[WhatsApp API] Sending Template '${templateName}' to ${to}`)
    
    // In a real implementation:
    /*
    const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components
        }
      })
    })
    return await response.json()
    */

    return { success: true, mocked: true, messageId: 'wa_' + Date.now() }
  }

  /**
   * Sends a free-form text message (only allowed if customer messaged within last 24 hours).
   */
  async sendTextMessage(to: string, text: string) {
    console.log(`[WhatsApp API] Sending Text to ${to}: ${text}`)
    return { success: true, mocked: true, messageId: 'wa_text_' + Date.now() }
  }
}
