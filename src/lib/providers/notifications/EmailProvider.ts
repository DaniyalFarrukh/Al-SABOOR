export class EmailProvider {
  async sendEmail(to: string, subject: string, body: string) {
    console.log(`[Email API] Sending Email to ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${body}`)
    
    // In production, integrate Resend, AWS SES, or SendGrid here
    return { success: true, mocked: true, messageId: 'email_' + Date.now() }
  }
}
