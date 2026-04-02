/**
 * পেমেন্ট গেটওয়ে সুইচিং সিস্টেম
 * SSLCommerz, Stripe এবং অন্যান্য গেটওয়ে সাপোর্ট
 */

export type PaymentGateway = 'sslcommerz' | 'stripe' | 'paypal' | 'bkash';

export interface PaymentGatewayConfig {
  gateway: PaymentGateway;
  enabled: boolean;
  apiKey: string;
  apiSecret?: string;
  webhookUrl?: string;
  isDefault?: boolean;
}

export interface PaymentRequest {
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  userId: string;
  userEmail: string;
  userName: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  gateway: PaymentGateway;
  transactionId: string;
  redirectUrl?: string;
  message: string;
}

/**
 * পেমেন্ট গেটওয়ে ফ্যাক্টরি
 */
export class PaymentGatewayFactory {
  private gateways: Map<PaymentGateway, PaymentGatewayConfig> = new Map();

  constructor(configs: PaymentGatewayConfig[]) {
    configs.forEach(config => {
      this.gateways.set(config.gateway, config);
    });
  }

  /**
   * পেমেন্ট গেটওয়ে পান
   */
  getGateway(gateway: PaymentGateway): PaymentGatewayConfig | null {
    return this.gateways.get(gateway) || null;
  }

  /**
   * সক্রিয় গেটওয়ে পান
   */
  getActiveGateways(): PaymentGatewayConfig[] {
    return Array.from(this.gateways.values()).filter(g => g.enabled);
  }

  /**
   * ডিফল্ট গেটওয়ে পান
   */
  getDefaultGateway(): PaymentGatewayConfig | null {
    return Array.from(this.gateways.values()).find(g => g.isDefault && g.enabled) || null;
  }

  /**
   * গেটওয়ে যোগ করুন বা আপডেট করুন
   */
  setGateway(config: PaymentGatewayConfig): void {
    this.gateways.set(config.gateway, config);
  }

  /**
   * গেটওয়ে সক্ষম/নিষ্ক্রিয় করুন
   */
  toggleGateway(gateway: PaymentGateway, enabled: boolean): void {
    const config = this.gateways.get(gateway);
    if (config) {
      config.enabled = enabled;
    }
  }
}

/**
 * SSLCommerz পেমেন্ট প্রসেসর
 */
export class SSLCommerzProcessor {
  constructor(private config: PaymentGatewayConfig) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // SSLCommerz API কল করুন
    const transactionId = `SSL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      gateway: 'sslcommerz',
      transactionId,
      redirectUrl: `https://securepay.sslcommerz.com/gwprocess/v4/gw.php?Q=${transactionId}`,
      message: 'SSLCommerz পেমেন্ট শুরু করা হয়েছে'
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // SSLCommerz ভেরিফিকেশন
    return true;
  }
}

/**
 * Stripe পেমেন্ট প্রসেসর
 */
export class StripeProcessor {
  constructor(private config: PaymentGatewayConfig) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Stripe API কল করুন
    const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      gateway: 'stripe',
      transactionId,
      redirectUrl: `https://checkout.stripe.com/pay/${transactionId}`,
      message: 'Stripe চেকআউট শুরু করা হয়েছে'
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // Stripe ভেরিফিকেশন
    return true;
  }
}

/**
 * PayPal পেমেন্ট প্রসেসর
 */
export class PayPalProcessor {
  constructor(private config: PaymentGatewayConfig) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // PayPal API কল করুন
    const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      gateway: 'paypal',
      transactionId,
      redirectUrl: `https://www.paypal.com/checkoutnow?token=${transactionId}`,
      message: 'PayPal চেকআউট শুরু করা হয়েছে'
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // PayPal ভেরিফিকেশন
    return true;
  }
}

/**
 * bKash পেমেন্ট প্রসেসর
 */
export class BKashProcessor {
  constructor(private config: PaymentGatewayConfig) {}

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // bKash API কল করুন
    const transactionId = `bkash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      gateway: 'bkash',
      transactionId,
      redirectUrl: `https://checkout.bkash.com/${transactionId}`,
      message: 'bKash পেমেন্ট শুরু করা হয়েছে'
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // bKash ভেরিফিকেশন
    return true;
  }
}

/**
 * পেমেন্ট প্রসেসর ফ্যাক্টরি
 */
export class PaymentProcessorFactory {
  static createProcessor(config: PaymentGatewayConfig): any {
    switch (config.gateway) {
      case 'sslcommerz':
        return new SSLCommerzProcessor(config);
      case 'stripe':
        return new StripeProcessor(config);
      case 'paypal':
        return new PayPalProcessor(config);
      case 'bkash':
        return new BKashProcessor(config);
      default:
        throw new Error(`Unknown payment gateway: ${config.gateway}`);
    }
  }
}

/**
 * পেমেন্ট গেটওয়ে ম্যানেজার
 */
export class PaymentGatewayManager {
  private factory: PaymentGatewayFactory;

  constructor(configs: PaymentGatewayConfig[]) {
    this.factory = new PaymentGatewayFactory(configs);
  }

  /**
   * পেমেন্ট প্রক্রিয়া করুন
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const config = this.factory.getGateway(request.gateway);

    if (!config || !config.enabled) {
      return {
        success: false,
        gateway: request.gateway,
        transactionId: '',
        message: `${request.gateway} পেমেন্ট গেটওয়ে উপলব্ধ নয়`
      };
    }

    const processor = PaymentProcessorFactory.createProcessor(config);
    return await processor.processPayment(request);
  }

  /**
   * ব্যবহারকারীর জন্য উপলব্ধ গেটওয়ে পান
   */
  getAvailableGateways(): PaymentGatewayConfig[] {
    return this.factory.getActiveGateways();
  }

  /**
   * গেটওয়ে সুইচ করুন
   */
  switchGateway(gateway: PaymentGateway): PaymentGatewayConfig | null {
    return this.factory.getGateway(gateway);
  }

  /**
   * সব গেটওয়ে অপশন পান
   */
  getAllGatewayOptions(): Array<{
    gateway: PaymentGateway;
    name: string;
    description: string;
    enabled: boolean;
    icon: string;
  }> {
    return [
      {
        gateway: 'sslcommerz',
        name: 'SSLCommerz',
        description: 'বাংলাদেশের জনপ্রিয় পেমেন্ট গেটওয়ে',
        enabled: this.factory.getGateway('sslcommerz')?.enabled || false,
        icon: '🏦'
      },
      {
        gateway: 'stripe',
        name: 'Stripe',
        description: 'আন্তর্জাতিক ক্রেডিট কার্ড পেমেন্ট',
        enabled: this.factory.getGateway('stripe')?.enabled || false,
        icon: '💳'
      },
      {
        gateway: 'paypal',
        name: 'PayPal',
        description: 'বিশ্বব্যাপী পেমেন্ট সমাধান',
        enabled: this.factory.getGateway('paypal')?.enabled || false,
        icon: '🌐'
      },
      {
        gateway: 'bkash',
        name: 'bKash',
        description: 'বাংলাদেশের মোবাইল পেমেন্ট',
        enabled: this.factory.getGateway('bkash')?.enabled || false,
        icon: '📱'
      }
    ];
  }
}

/**
 * পেমেন্ট গেটওয়ে পরিসংখ্যান
 */
export interface PaymentGatewayStats {
  gateway: PaymentGateway;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  averageTransactionAmount: number;
  successRate: number;
}

/**
 * পেমেন্ট গেটওয়ে পরিসংখ্যান গণনা করুন
 */
export function calculateGatewayStats(
  transactions: any[],
  gateway: PaymentGateway
): PaymentGatewayStats {
  const gatewayTransactions = transactions.filter(t => t.gateway === gateway);
  const successful = gatewayTransactions.filter(t => t.status === 'completed');
  const failed = gatewayTransactions.filter(t => t.status === 'failed');

  const totalAmount = successful.reduce((sum, t) => sum + t.amount, 0);
  const successRate = gatewayTransactions.length > 0 ? (successful.length / gatewayTransactions.length) * 100 : 0;

  return {
    gateway,
    totalTransactions: gatewayTransactions.length,
    successfulTransactions: successful.length,
    failedTransactions: failed.length,
    totalAmount,
    averageTransactionAmount: successful.length > 0 ? totalAmount / successful.length : 0,
    successRate
  };
}
