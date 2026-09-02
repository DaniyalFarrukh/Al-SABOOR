export interface ShippingRateResult {
  cost: number;
  estimatedDays: number;
  providerName: string;
}

export abstract class ShippingProvider {
  protected providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  /**
   * Generates a tracking URL for the customer
   */
  abstract generateTrackingUrl(trackingNumber: string): string;

  /**
   * Calculates dynamic shipping rates based on weight, dimensions, and destination
   */
  abstract calculateRate(
    destinationPostalCode: string,
    weightKg: number
  ): Promise<ShippingRateResult>;
}

/**
 * Mock implementation for local couriers (e.g., TCS, Leopards)
 */
export class LocalCourierProvider extends ShippingProvider {
  constructor(name: string = 'TCS') {
    super(name);
  }

  generateTrackingUrl(trackingNumber: string): string {
    if (this.providerName.toLowerCase().includes('tcs')) {
      return `https://www.tcsexpress.com/tracking?track=${trackingNumber}`;
    }
    return `https://tracking.example.com/${trackingNumber}`;
  }

  async calculateRate(destinationPostalCode: string, weightKg: number): Promise<ShippingRateResult> {
    // Flat rate mock calculation
    return {
      cost: 250 + (weightKg > 1 ? (weightKg - 1) * 100 : 0),
      estimatedDays: 3,
      providerName: this.providerName
    };
  }
}
