# SSLCommerz Webhook নিবন্ধন গাইড

এই গাইডটি আপনার SSLCommerz অ্যাকাউন্টে Webhook নিবন্ধন করার জন্য ধাপে ধাপে নির্দেশনা প্রদান করে।

## Webhook কি?

Webhook হল একটি স্বয়ংক্রিয় বার্তা যা SSLCommerz পেমেন্ট সম্পূর্ণ হলে আপনার সার্ভারে পাঠায়। এটি আপনার অ্যাপ্লিকেশনকে পেমেন্ট স্ট্যাটাস সম্পর্কে তাৎক্ষণিক আপডেট পেতে সাহায্য করে।

## আপনার Webhook URL

আপনার অ্যাপ্লিকেশনের Webhook এন্ডপয়েন্ট:

```
https://yourdomain.com/api/sslcommerz/webhook
```

**নোট**: `yourdomain.com` আপনার প্রকৃত ডোমেইন দিয়ে প্রতিস্থাপন করুন।

## SSLCommerz ড্যাশবোর্ডে Webhook সেটআপ করুন

### ধাপ 1: SSLCommerz ড্যাশবোর্ডে লগইন করুন

1. [SSLCommerz ড্যাশবোর্ড](https://dashboard.sslcommerz.com) এ যান
2. আপনার স্টোর ID এবং পাসওয়ার্ড দিয়ে লগইন করুন

### ধাপ 2: সেটিংস মেনুতে যান

1. ড্যাশবোর্ডের বাম পাশে **সেটিংস** বা **Settings** খুঁজুন
2. **API সেটিংস** বা **API Settings** এ ক্লিক করুন

### ধাপ 3: Webhook কনফিগারেশন খুঁজুন

1. **Webhook** বা **IPN Settings** বিভাগ খুঁজুন
2. **Webhook URL** ফিল্ডে আপনার URL পেস্ট করুন:
   ```
   https://yourdomain.com/api/sslcommerz/webhook
   ```

### ধাপ 4: Webhook ইভেন্ট নির্বাচন করুন

নিম্নলিখিত ইভেন্টগুলি সক্ষম করুন:

- ✅ **Payment Success** - পেমেন্ট সফল হলে
- ✅ **Payment Failed** - পেমেন্ট ব্যর্থ হলে
- ✅ **Payment Cancelled** - পেমেন্ট বাতিল হলে

### ধাপ 5: সংরক্ষণ করুন

1. **সংরক্ষণ করুন** বা **Save** বাটনে ক্লিক করুন
2. সফল বার্তা দেখুন

## Webhook পরীক্ষা করুন

### টেস্ট মোডে Webhook পাঠান

SSLCommerz ড্যাশবোর্ডে একটি টেস্ট Webhook পাঠানোর অপশন থাকতে পারে:

1. **Webhook সেটিংস** পৃষ্ঠায় থাকুন
2. **টেস্ট Webhook পাঠান** বা **Send Test Webhook** বাটন খুঁজুন
3. ক্লিক করুন এবং আপনার সার্ভার লগ চেক করুন

### আপনার সার্ভার লগ চেক করুন

1. আপনার অ্যাপ্লিকেশন সার্ভার লগ খুলুন
2. নিম্নলিখিত বার্তা খুঁজুন:
   ```
   [Webhook] Received webhook: ...
   [Webhook] Processing valid payment: ...
   ```

## Webhook পেলোড উদাহরণ

SSLCommerz যে ডেটা পাঠায় তার উদাহরণ:

```json
{
  "tran_id": "TRANSACTION_ID_123",
  "status": "VALID",
  "amount": "299.00",
  "currency": "BDT",
  "card_type": "VISA",
  "card_number": "411111****1111",
  "bank_tran_id": "BANK_TRANSACTION_ID",
  "val_id": "VALIDATION_ID",
  "risk_level": "0",
  "risk_title": "Safe",
  "store_id": "your_store_id",
  "verify_sign": "GENERATED_SIGNATURE"
}
```

## সাধারণ সমস্যা সমাধান

### সমস্যা 1: Webhook পাঠানো হচ্ছে না

**সম্ভাব্য কারণ:**
- URL ভুল বা অ্যাক্সেসযোগ্য নয়
- HTTPS সক্ষম নয়
- ফায়ারওয়াল Webhook ব্লক করছে

**সমাধান:**
- URL সঠিক কিনা যাচাই করুন
- HTTPS ব্যবহার নিশ্চিত করুন
- ফায়ারওয়াল নিয়ম চেক করুন

### সমস্যা 2: স্বাক্ষর যাচাইকরণ ব্যর্থ

**সম্ভাব্য কারণ:**
- Store Password ভুল
- Payload পরিবর্তিত হয়েছে

**সমাধান:**
- Store Password সঠিক কিনা নিশ্চিত করুন
- Payload পরিবর্তন হচ্ছে না তা চেক করুন

### সমস্যা 3: Webhook পাঠানো হচ্ছে কিন্তু প্রসেস হচ্ছে না

**সম্ভাব্য কারণ:**
- সার্ভার ত্রুটি
- ডেটাবেস সংযোগ সমস্যা

**সমাধান:**
- সার্ভার লগ চেক করুন
- ডেটাবেস সংযোগ যাচাই করুন

## উৎপাদন স্থাপনা চেকলিস্ট

লাইভ মোডে যাওয়ার আগে নিশ্চিত করুন:

- [ ] HTTPS সক্ষম করা হয়েছে
- [ ] Webhook URL সঠিক এবং অ্যাক্সেসযোগ্য
- [ ] Store ID এবং পাসওয়ার্ড লাইভ ক্রেডেনশিয়ালে আপডেট করা হয়েছে
- [ ] Webhook স্বাক্ষর যাচাইকরণ কাজ করছে
- [ ] ডেটাবেস সংযোগ স্থিতিশীল
- [ ] লগিং সক্ষম করা হয়েছে
- [ ] ব্যাকআপ সিস্টেম প্রস্তুত

## সহায়ক সংস্থান

- [SSLCommerz ডকুমেন্টেশন](https://sslcommerz.com)
- [Webhook API রেফারেন্স](https://developer.sslcommerz.com/doc/v4/#webhook)
- [স্টোর সেটিংস গাইড](https://sslcommerz.com/docs/store-setup)

## যোগাযোগ করুন

যদি কোনো সমস্যা হয়:

- **SSLCommerz সাপোর্ট**: support@sslcommerz.com
- **আপনার অ্যাপ্লিকেশন লগ**: সার্ভার লগ ফাইল চেক করুন
