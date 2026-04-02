import crypto from 'crypto';

/**
 * ডিসকাউন্ট কোড সিস্টেম
 * প্রচারমূলক কোড এবং কুপন ম্যানেজমেন্ট
 */

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  currentUses: number;
  expiryDate: Date;
  applicablePlans: string[]; // ['free', 'pro', 'premium']
  minPurchaseAmount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscountValidation {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  message: string;
}

/**
 * ডিসকাউন্ট কোড জেনারেট করুন
 */
export function generateDiscountCode(prefix: string = 'PROMO'): string {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${randomPart}`;
}

/**
 * ডিসকাউন্ট কোড যাচাই করুন
 */
export function validateDiscountCode(
  code: DiscountCode,
  originalPrice: number,
  userPlan: string
): DiscountValidation {
  // কোড সক্রিয় আছে কিনা চেক করুন
  if (!code.isActive) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: originalPrice,
      message: 'এই কোডটি আর সক্রিয় নেই।'
    };
  }

  // এক্সপায়ারি ডেট চেক করুন
  if (new Date() > code.expiryDate) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: originalPrice,
      message: 'এই কোডটির মেয়াদ শেষ হয়েছে।'
    };
  }

  // ব্যবহারের সীমা চেক করুন
  if (code.currentUses >= code.maxUses) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: originalPrice,
      message: 'এই কোডটির ব্যবহারের সীমা শেষ হয়েছে।'
    };
  }

  // প্ল্যান প্রযোজ্যতা চেক করুন
  if (!code.applicablePlans.includes(userPlan)) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: originalPrice,
      message: `এই কোডটি ${userPlan} প্ল্যানে প্রযোজ্য নয়।`
    };
  }

  // ন্যূনতম ক্রয় পরিমাণ চেক করুন
  if (code.minPurchaseAmount && originalPrice < code.minPurchaseAmount) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: originalPrice,
      message: `ন্যূনতম ${code.minPurchaseAmount} টাকা ক্রয় করতে হবে।`
    };
  }

  // ডিসকাউন্ট পরিমাণ গণনা করুন
  let discountAmount = 0;
  if (code.discountType === 'percentage') {
    discountAmount = (originalPrice * code.discountValue) / 100;
  } else {
    discountAmount = code.discountValue;
  }

  // চূড়ান্ত মূল্য গণনা করুন
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    isValid: true,
    discountAmount,
    finalPrice,
    message: 'কোডটি সফলভাবে প্রয়োগ করা হয়েছে।'
  };
}

/**
 * ডিসকাউন্ট কোড ব্যবহার বৃদ্ধি করুন
 */
export function incrementCodeUsage(code: DiscountCode): DiscountCode {
  return {
    ...code,
    currentUses: code.currentUses + 1,
    updatedAt: new Date()
  };
}

/**
 * বাল্ক ডিসকাউন্ট কোড তৈরি করুন
 */
export function generateBulkDiscountCodes(
  count: number,
  config: Omit<DiscountCode, 'id' | 'code' | 'currentUses' | 'createdAt' | 'updatedAt'>
): DiscountCode[] {
  const codes: DiscountCode[] = [];

  for (let i = 0; i < count; i++) {
    codes.push({
      id: crypto.randomUUID(),
      code: generateDiscountCode(),
      currentUses: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...config
    });
  }

  return codes;
}

/**
 * ডিসকাউন্ট কোড পরিসংখ্যান
 */
export interface DiscountCodeStats {
  totalCodes: number;
  activeCodes: number;
  expiredCodes: number;
  totalUsages: number;
  totalDiscountGiven: number;
}

/**
 * ডিসকাউন্ট কোড পরিসংখ্যান গণনা করুন
 */
export function calculateDiscountStats(codes: DiscountCode[], transactions: any[]): DiscountCodeStats {
  const now = new Date();

  const activeCodes = codes.filter(c => c.isActive && c.expiryDate > now).length;
  const expiredCodes = codes.filter(c => c.expiryDate <= now).length;
  const totalUsages = codes.reduce((sum, c) => sum + c.currentUses, 0);

  // মোট ছাড় গণনা করুন
  let totalDiscountGiven = 0;
  transactions.forEach(tx => {
    if (tx.discountCode) {
      const code = codes.find(c => c.id === tx.discountCode);
      if (code) {
        if (code.discountType === 'percentage') {
          totalDiscountGiven += (tx.originalAmount * code.discountValue) / 100;
        } else {
          totalDiscountGiven += code.discountValue;
        }
      }
    }
  });

  return {
    totalCodes: codes.length,
    activeCodes,
    expiredCodes,
    totalUsages,
    totalDiscountGiven
  };
}

/**
 * সাধারণ ডিসকাউন্ট কোড টেমপ্লেট
 */
export const DISCOUNT_CODE_TEMPLATES = {
  // ২০% ছাড় - সব প্ল্যানে
  WELCOME20: {
    discountType: 'percentage' as const,
    discountValue: 20,
    maxUses: 1000,
    applicablePlans: ['free', 'pro', 'premium'],
    minPurchaseAmount: 0
  },

  // ৫০০ টাকা ছাড় - প্রিমিয়াম প্ল্যানে
  PREMIUM500: {
    discountType: 'fixed' as const,
    discountValue: 500,
    maxUses: 100,
    applicablePlans: ['premium'],
    minPurchaseAmount: 1000
  },

  // ১০% ছাড় - প্রো প্ল্যানে
  PRO10: {
    discountType: 'percentage' as const,
    discountValue: 10,
    maxUses: 500,
    applicablePlans: ['pro', 'premium'],
    minPurchaseAmount: 500
  },

  // বিশেষ অফার - ৩০% ছাড়
  SPECIAL30: {
    discountType: 'percentage' as const,
    discountValue: 30,
    maxUses: 50,
    applicablePlans: ['free', 'pro', 'premium'],
    minPurchaseAmount: 0
  }
};
