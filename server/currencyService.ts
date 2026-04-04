/**
 * Multi-Currency Support Service
 * Handles currency conversion, formatting, and validation
 */

export type SupportedCurrency = "usd" | "eur" | "bdt" | "gbp" | "jpy" | "inr";

interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  exchangeRate: number; // relative to USD
  region: string;
}

const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  usd: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimals: 2,
    exchangeRate: 1,
    region: "International",
  },
  eur: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    decimals: 2,
    exchangeRate: 0.92,
    region: "Europe",
  },
  bdt: {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    decimals: 0,
    exchangeRate: 109.5,
    region: "Bangladesh",
  },
  gbp: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    decimals: 2,
    exchangeRate: 0.79,
    region: "United Kingdom",
  },
  jpy: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    decimals: 0,
    exchangeRate: 149.5,
    region: "Japan",
  },
  inr: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    decimals: 2,
    exchangeRate: 83.2,
    region: "India",
  },
};

/**
 * Format amount with currency symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = "usd",
  includeCode: boolean = false
): string {
  const config = CURRENCY_CONFIGS[currency];
  const formatted = amount.toFixed(config.decimals);

  if (includeCode) {
    return `${config.symbol}${formatted} ${config.code}`;
  }
  return `${config.symbol}${formatted}`;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromConfig = CURRENCY_CONFIGS[fromCurrency];
  const toConfig = CURRENCY_CONFIGS[toCurrency];

  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromConfig.exchangeRate;
  const convertedAmount = amountInUSD * toConfig.exchangeRate;

  return parseFloat(convertedAmount.toFixed(toConfig.decimals));
}

/**
 * Get currency configuration
 */
export function getCurrencyConfig(currency: SupportedCurrency): CurrencyConfig {
  return CURRENCY_CONFIGS[currency];
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Array<{
  code: SupportedCurrency;
  name: string;
  symbol: string;
  region: string;
}> {
  return Object.entries(CURRENCY_CONFIGS).map(([code, config]) => ({
    code: code as SupportedCurrency,
    name: config.name,
    symbol: config.symbol,
    region: config.region,
  }));
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  const fromConfig = CURRENCY_CONFIGS[fromCurrency];
  const toConfig = CURRENCY_CONFIGS[toCurrency];

  return toConfig.exchangeRate / fromConfig.exchangeRate;
}

/**
 * Validate if currency is supported
 */
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return currency in CURRENCY_CONFIGS;
}

/**
 * Get currency by region
 */
export function getCurrencyByRegion(region: string): SupportedCurrency | null {
  const entry = Object.entries(CURRENCY_CONFIGS).find(
    ([_, config]) => config.region.toLowerCase() === region.toLowerCase()
  );
  return entry ? (entry[0] as SupportedCurrency) : null;
}

/**
 * Parse amount string with currency
 */
export function parseCurrencyAmount(
  input: string
): { amount: number; currency: SupportedCurrency } | null {
  // Try to match patterns like "$100", "€50.50", "৳1000", etc.
  const patterns = [
    /^\s*\$\s*([\d.]+)\s*$/, // $100
    /^\s*€\s*([\d.]+)\s*$/, // €50
    /^\s*৳\s*([\d.]+)\s*$/, // ৳1000
    /^\s*£\s*([\d.]+)\s*$/, // £100
    /^\s*¥\s*([\d.]+)\s*$/, // ¥1000
    /^\s*₹\s*([\d.]+)\s*$/, // ₹1000
    /^\s*([\d.]+)\s*(USD|EUR|BDT|GBP|JPY|INR)\s*$/i, // 100 USD
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount)) {
        // Determine currency from symbol or code
        if (match[2]) {
          const currencyCode = match[2].toLowerCase();
          if (isValidCurrency(currencyCode as SupportedCurrency)) {
            return {
              amount,
              currency: currencyCode as SupportedCurrency,
            };
          }
        }

        // Guess currency from symbol
        if (input.includes("$")) return { amount, currency: "usd" };
        if (input.includes("€")) return { amount, currency: "eur" };
        if (input.includes("৳")) return { amount, currency: "bdt" };
        if (input.includes("£")) return { amount, currency: "gbp" };
        if (input.includes("¥")) return { amount, currency: "jpy" };
        if (input.includes("₹")) return { amount, currency: "inr" };
      }
    }
  }

  return null;
}

/**
 * Get minimum payment amount for currency (to comply with payment processor limits)
 */
export function getMinimumPaymentAmount(currency: SupportedCurrency): number {
  // Stripe minimum is $0.50 USD
  const minimumUSD = 0.5;
  return convertCurrency(minimumUSD, "usd", currency);
}

/**
 * Get maximum payment amount for currency
 */
export function getMaximumPaymentAmount(currency: SupportedCurrency): number {
  // Stripe maximum is $999,999.99 USD
  const maximumUSD = 999999.99;
  return convertCurrency(maximumUSD, "usd", currency);
}

/**
 * Validate payment amount for currency
 */
export function validatePaymentAmount(
  amount: number,
  currency: SupportedCurrency
): { valid: boolean; error?: string } {
  const min = getMinimumPaymentAmount(currency);
  const max = getMaximumPaymentAmount(currency);

  if (amount < min) {
    return {
      valid: false,
      error: `Minimum payment amount is ${formatCurrency(min, currency)}`,
    };
  }

  if (amount > max) {
    return {
      valid: false,
      error: `Maximum payment amount is ${formatCurrency(max, currency)}`,
    };
  }

  return { valid: true };
}

/**
 * Format price for display in different currencies
 */
export function formatPrice(
  baseAmountUSD: number,
  targetCurrency: SupportedCurrency = "usd"
): string {
  const convertedAmount = convertCurrency(baseAmountUSD, "usd", targetCurrency);
  return formatCurrency(convertedAmount, targetCurrency, true);
}
