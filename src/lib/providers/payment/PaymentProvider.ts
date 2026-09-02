export interface PaymentResult {
  success: boolean;
  transactionReference?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundReference?: string;
  error?: string;
}

export abstract class PaymentProvider {
  protected providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  /**
   * Initializes a payment session or charges the customer directly.
   */
  abstract processPayment(
    amount: number,
    orderId: string,
    customerInfo: { email: string; phone: string; name: string }
  ): Promise<PaymentResult>;

  /**
   * Processes a refund back to the customer's payment method.
   */
  abstract processRefund(
    transactionReference: string,
    amount: number,
    reason: string
  ): Promise<RefundResult>;

  /**
   * Verifies incoming webhooks to ensure they are genuinely from the provider.
   */
  abstract verifyWebhookSignature(payload: any, signature: string): boolean;
}

/**
 * Mock implementation for Cash on Delivery
 */
export class CODPaymentProvider extends PaymentProvider {
  constructor() {
    super('COD');
  }

  async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
    // COD is instantly 'pending' payment upon delivery
    return {
      success: true,
      status: 'pending',
      transactionReference: `COD-${orderId}-${Date.now()}`
    };
  }

  async processRefund(): Promise<RefundResult> {
    return {
      success: false,
      error: 'Cannot automatically process refunds for Cash on Delivery. Manual bank transfer required.'
    };
  }

  verifyWebhookSignature(): boolean {
    return true; // COD doesn't have webhooks
  }
}
