/**
 * Payment Service - Unified payment handling for all gateways
 * Supports: Stripe, SSLCommerz, bKash, Nagad, Rocket
 */

import Stripe from "stripe";

interface PaymentInitiateRequest {
  userId: number;
  amount: number;
  currency: string;
  planId: number;
  gateway: "stripe" | "sslcommerz" | "bkash" | "nagad" | "rocket";
  description?: string;
  metadata?: Record<string, string>;
}

interface PaymentVerifyRequest {
  transactionId: string;
  gateway: "stripe" | "sslcommerz" | "bkash" | "nagad" | "rocket";
  paymentId?: string;
  token?: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  clientSecret?: string;
  message: string;
}

interface VerifyResponse {
  success: boolean;
  status: "pending" | "completed" | "failed";
  message: string;
  amount?: number;
}

/**
 * Initialize Stripe payment
 */
export async function initiateStripePayment(request: PaymentInitiateRequest): Promise<PaymentResponse> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-06-20",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency.toLowerCase(),
      description: request.description || `Subscription Plan - User ${request.userId}`,
      metadata: {
        userId: request.userId.toString(),
        planId: request.planId.toString(),
        ...request.metadata,
      },
    });

    return {
      success: true,
      transactionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || "",
      message: "Payment intent created successfully",
    };
  } catch (error) {
    console.error("Stripe payment error:", error);
    return {
      success: false,
      transactionId: "",
      message: "Failed to initiate Stripe payment",
    };
  }
}

/**
 * Initiate SSLCommerz payment
 */
export async function initiateSSLCommerzPayment(request: PaymentInitiateRequest): Promise<PaymentResponse> {
  try {
    // SSLCommerz API endpoint
    const endpoint = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASS;

    if (!storeId || !storePassword) {
      throw new Error("SSLCommerz credentials not configured");
    }

    const postData = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: request.amount,
      currency: request.currency,
      tran_id: `${request.userId}-${Date.now()}`,
      success_url: `${process.env.APP_URL}/payment/success`,
      fail_url: `${process.env.APP_URL}/payment/failed`,
      cancel_url: `${process.env.APP_URL}/payment/cancelled`,
      cus_name: `User ${request.userId}`,
      cus_email: `user${request.userId}@bayojidai.com`,
      cus_phone: "01700000000",
      product_name: `Plan ${request.planId}`,
      product_category: "subscription",
      product_profile: "general",
      multi_card_name: "mastercard,visacard,amexcard,bkash,nagad,rocket",
    };

    // TODO: Make actual API call to SSLCommerz
    // For now, return mock response
    return {
      success: true,
      transactionId: postData.tran_id,
      paymentUrl: `${endpoint}?${new URLSearchParams(postData as any).toString()}`,
      message: "SSLCommerz payment initiated",
    };
  } catch (error) {
    console.error("SSLCommerz payment error:", error);
    return {
      success: false,
      transactionId: "",
      message: "Failed to initiate SSLCommerz payment",
    };
  }
}

/**
 * Initiate bKash payment
 */
export async function initiateBkashPayment(request: PaymentInitiateRequest): Promise<PaymentResponse> {
  try {
    // bKash API endpoint
    const endpoint = "https://checkout.sandbox.bka.sh/api/checkout/payment/create";

    const bkashToken = process.env.BKASH_TOKEN;

    if (!bkashToken) {
      throw new Error("bKash token not configured");
    }

    const payload = {
      mode: "0011",
      payerReference: `USER-${request.userId}`,
      callbackURL: `${process.env.APP_URL}/payment/bkash/callback`,
      amount: request.amount,
      currency: request.currency,
      intent: "sale",
      merchantInvoiceNumber: `INV-${request.userId}-${Date.now()}`,
    };

    // TODO: Make actual API call to bKash
    // For now, return mock response
    return {
      success: true,
      transactionId: payload.merchantInvoiceNumber,
      paymentUrl: `${endpoint}?token=${bkashToken}`,
      message: "bKash payment initiated",
    };
  } catch (error) {
    console.error("bKash payment error:", error);
    return {
      success: false,
      transactionId: "",
      message: "Failed to initiate bKash payment",
    };
  }
}

/**
 * Initiate Nagad payment
 */
export async function initiateNagadPayment(request: PaymentInitiateRequest): Promise<PaymentResponse> {
  try {
    // Nagad API endpoint
    const endpoint = "https://api.sandbox.nagad.com.bd/api/dfs/initiate-payment";

    const nagadMerchantId = process.env.NAGAD_MERCHANT_ID;
    const nagadMerchantPassword = process.env.NAGAD_MERCHANT_PASSWORD;

    if (!nagadMerchantId || !nagadMerchantPassword) {
      throw new Error("Nagad credentials not configured");
    }

    const payload = {
      merchantId: nagadMerchantId,
      orderId: `ORD-${request.userId}-${Date.now()}`,
      amount: request.amount,
      currencyCode: "050", // BDT
      orderDescription: request.description || `Subscription Plan ${request.planId}`,
      failureCallbackUrl: `${process.env.APP_URL}/payment/nagad/failed`,
      successCallbackUrl: `${process.env.APP_URL}/payment/nagad/success`,
    };

    // TODO: Make actual API call to Nagad
    // For now, return mock response
    return {
      success: true,
      transactionId: payload.orderId,
      message: "Nagad payment initiated",
    };
  } catch (error) {
    console.error("Nagad payment error:", error);
    return {
      success: false,
      transactionId: "",
      message: "Failed to initiate Nagad payment",
    };
  }
}

/**
 * Initiate Rocket payment
 */
export async function initiateRocketPayment(request: PaymentInitiateRequest): Promise<PaymentResponse> {
  try {
    // Rocket API endpoint
    const endpoint = "https://api.sandbox.rocket.com.bd/api/payment/initiate";

    const rocketApiKey = process.env.ROCKET_API_KEY;

    if (!rocketApiKey) {
      throw new Error("Rocket API key not configured");
    }

    const payload = {
      apiKey: rocketApiKey,
      transactionId: `TXN-${request.userId}-${Date.now()}`,
      amount: request.amount,
      currency: request.currency,
      description: request.description || `Subscription Plan ${request.planId}`,
      returnUrl: `${process.env.APP_URL}/payment/rocket/callback`,
      cancelUrl: `${process.env.APP_URL}/payment/rocket/cancelled`,
    };

    // TODO: Make actual API call to Rocket
    // For now, return mock response
    return {
      success: true,
      transactionId: payload.transactionId,
      message: "Rocket payment initiated",
    };
  } catch (error) {
    console.error("Rocket payment error:", error);
    return {
      success: false,
      transactionId: "",
      message: "Failed to initiate Rocket payment",
    };
  }
}

/**
 * Initiate payment with any gateway
 */
export async function initiatePayment(request: PaymentInitiateRequest): Promise<PaymentResponse> {
  switch (request.gateway) {
    case "stripe":
      return initiateStripePayment(request);
    case "sslcommerz":
      return initiateSSLCommerzPayment(request);
    case "bkash":
      return initiateBkashPayment(request);
    case "nagad":
      return initiateNagadPayment(request);
    case "rocket":
      return initiateRocketPayment(request);
    default:
      return {
        success: false,
        transactionId: "",
        message: "Unknown payment gateway",
      };
  }
}

/**
 * Verify Stripe payment
 */
export async function verifyStripePayment(paymentIntentId: string): Promise<VerifyResponse> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-06-20",
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status === "succeeded" ? "completed" : "pending",
      message: `Payment status: ${paymentIntent.status}`,
      amount: paymentIntent.amount ? paymentIntent.amount / 100 : undefined,
    };
  } catch (error) {
    console.error("Stripe verification error:", error);
    return {
      success: false,
      status: "failed",
      message: "Failed to verify Stripe payment",
    };
  }
}

/**
 * Verify payment with any gateway
 */
export async function verifyPayment(request: PaymentVerifyRequest): Promise<VerifyResponse> {
  switch (request.gateway) {
    case "stripe":
      return verifyStripePayment(request.transactionId);
    case "sslcommerz":
      // TODO: Implement SSLCommerz verification
      return {
        success: false,
        status: "pending",
        message: "SSLCommerz verification not yet implemented",
      };
    case "bkash":
      // TODO: Implement bKash verification
      return {
        success: false,
        status: "pending",
        message: "bKash verification not yet implemented",
      };
    case "nagad":
      // TODO: Implement Nagad verification
      return {
        success: false,
        status: "pending",
        message: "Nagad verification not yet implemented",
      };
    case "rocket":
      // TODO: Implement Rocket verification
      return {
        success: false,
        status: "pending",
        message: "Rocket verification not yet implemented",
      };
    default:
      return {
        success: false,
        status: "failed",
        message: "Unknown payment gateway",
      };
  }
}
