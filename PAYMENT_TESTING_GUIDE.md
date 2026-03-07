# SSLCommerz পেমেন্ট টেস্টিং গাইড

এই গাইডটি আপনার AI চ্যাট অ্যাপ্লিকেশনে SSLCommerz পেমেন্ট ইন্টিগ্রেশন পরীক্ষা করার জন্য।

## সেটআপ সম্পূর্ণ ✅

আপনার অ্যাপ্লিকেশনে নিম্নলিখিত পেমেন্ট ফিচার যুক্ত করা হয়েছে:

### 1. **ডেটাবেস টেবিল**
- `sslcommerzTransactions` - লেনদেন রেকর্ড
- `subscriptionPlans` - সাবস্ক্রিপশন প্ল্যান
- `userSubscriptions` - ব্যবহারকারীর সাবস্ক্রিপশন
- `paymentInvoices` - পেমেন্ট ইনভয়েস

### 2. **ব্যাকএন্ড API**
- `POST /api/sslcommerz/initiate` - পেমেন্ট শুরু করুন
- `POST /api/sslcommerz/validate` - পেমেন্ট যাচাই করুন
- `POST /api/sslcommerz/webhook` - Webhook পেমেন্ট নোটিফিকেশন

### 3. **ফ্রন্টএন্ড UI**
- `/payment` - পেমেন্ট পৃষ্ঠা
- `/payment/success` - সাফল্য পৃষ্ঠা
- `/payment/failed` - ব্যর্থতা পৃষ্ঠা

## পরীক্ষার ধাপ

### ধাপ 1: পেমেন্ট পৃষ্ঠা অ্যাক্সেস করুন
```
URL: http://localhost:3000/payment
```

### ধাপ 2: সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন
- **ফ্রি**: ৳0 (কোনো পেমেন্ট প্রয়োজন নেই)
- **প্রো**: ৳299/মাস
- **প্রিমিয়াম**: ৳599/মাস

### ধাপ 3: পেমেন্ট শুরু করুন
"পেমেন্ট করুন" বাটনে ক্লিক করুন

### ধাপ 4: SSLCommerz চেকআউটে রিডাইরেক্ট হবেন
SSLCommerz পেমেন্ট গেটওয়ে খোলা হবে

### ধাপ 5: টেস্ট কার্ড ব্যবহার করুন
```
কার্ড নম্বর: 4111111111111111
এক্সপায়ারি: যেকোনো ভবিষ্যত তারিখ
CVV: যেকোনো 3 সংখ্যা
```

### ধাপ 6: পেমেন্ট সম্পূর্ণ করুন
সফল পেমেন্টের পর `/payment/success` পৃষ্ঠায় রিডাইরেক্ট হবেন

## Webhook টেস্টিং

### Webhook এন্ডপয়েন্ট
```
POST http://localhost:3000/api/sslcommerz/webhook
```

### টেস্ট Payload
```json
{
  "tran_id": "test_transaction_123",
  "status": "VALID",
  "amount": "299.00",
  "currency": "BDT",
  "card_type": "VISA",
  "card_number": "411111****1111",
  "bank_tran_id": "bank_123456",
  "val_id": "val_123456",
  "risk_level": "0",
  "risk_title": "Safe",
  "store_id": "bayoj698a3139c2df6",
  "verify_sign": "GENERATED_SIGNATURE"
}
```

### Webhook স্বাক্ষর যাচাইকরণ
Webhook স্বাক্ষর স্বয়ংক্রিয়ভাবে যাচাই করা হয়। নিশ্চিত করুন:
1. `SSLCOMMERZ_STORE_PASS` পরিবেশ ভেরিয়েবল সেট করা আছে
2. Payload MD5 হ্যাশ সঠিক

## ডেটাবেস যাচাইকরণ

### লেনদেন রেকর্ড চেক করুন
```sql
SELECT * FROM sslcommerzTransactions ORDER BY createdAt DESC LIMIT 1;
```

### সাবস্ক্রিপশন স্ট্যাটাস চেক করুন
```sql
SELECT * FROM userSubscriptions WHERE userId = YOUR_USER_ID;
```

### সাবস্ক্রিপশন প্ল্যান দেখুন
```sql
SELECT * FROM subscriptionPlans;
```

## সাধারণ সমস্যা সমাধান

### সমস্যা 1: Webhook স্বাক্ষর যাচাইকরণ ব্যর্থ
**সমাধান**: 
- `SSLCOMMERZ_STORE_PASS` সঠিক কিনা চেক করুন
- Payload সঠিক ফরম্যাটে আছে কিনা নিশ্চিত করুন

### সমস্যা 2: লেনদেন ডেটাবেসে সংরক্ষিত হচ্ছে না
**সমাধান**:
- ডেটাবেস সংযোগ চেক করুন
- `DATABASE_URL` পরিবেশ ভেরিয়েবল সেট করা আছে কিনা যাচাই করুন

### সমস্যা 3: সাবস্ক্রিপশন সক্রিয় হচ্ছে না
**সমাধান**:
- ব্যবহারকারীর জন্য সাবস্ক্রিপশন রেকর্ড আছে কিনা চেক করুন
- `userSubscriptions` টেবিলে সঠিক `userId` আছে কিনা নিশ্চিত করুন

## উৎপাদন স্থাপনা

লাইভ মোডে যাওয়ার আগে:

1. **লাইভ ক্রেডেনশিয়াল যোগ করুন**
   - SSLCommerz ড্যাশবোর্ড থেকে লাইভ Store ID এবং পাসওয়ার্ড পান
   - Settings → Payment-এ যোগ করুন

2. **Webhook URL নিবন্ধন করুন**
   - SSLCommerz ড্যাশবোর্ডে যান
   - Webhook URL সেট করুন: `https://yourdomain.com/api/sslcommerz/webhook`

3. **পরিবেশ ভেরিয়েবল আপডেট করুন**
   ```
   SSLCOMMERZ_STORE_ID=your_live_store_id
   SSLCOMMERZ_STORE_PASS=your_live_store_password
   ```

4. **HTTPS সক্ষম করুন**
   - SSLCommerz শুধুমাত্র HTTPS সাপোর্ট করে

## সহায়ক লিঙ্ক

- [SSLCommerz ডকুমেন্টেশন](https://sslcommerz.com)
- [API রেফারেন্স](https://developer.sslcommerz.com)
- [Webhook গাইড](https://developer.sslcommerz.com/doc/v4/#webhook)

## সমর্থন

যদি কোনো সমস্যা হয়:
1. ব্রাউজার কনসোল চেক করুন (F12)
2. সার্ভার লগ দেখুন
3. ডেটাবেস রেকর্ড যাচাই করুন
