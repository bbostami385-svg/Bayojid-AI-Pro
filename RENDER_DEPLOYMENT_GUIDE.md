# Render Deployment Guide - Bayojid AI Pro

এই গাইড আপনার AI Chat অ্যাপ্লিকেশন Render-এ ডিপ্লয় করার জন্য সম্পূর্ণ নির্দেশনা প্রদান করে।

## প্রয়োজনীয় জিনিস

- ✅ GitHub রিপোজিটরি (`Bayojid-AI-Pro`)
- ✅ Render অ্যাকাউন্ট (https://render.com)
- ✅ MySQL ডাটাবেস (Render বা অন্য প্রদানকারী)

## ধাপ 1: Render-এ নতুন Web Service তৈরি করুন

### 1.1 Render ড্যাশবোর্ডে যান
```
https://render.com/dashboard
```

### 1.2 নতুন Web Service তৈরি করুন
1. **New +** বাটন ক্লিক করুন
2. **Web Service** সিলেক্ট করুন
3. **GitHub** সংযোগ বিকল্প বেছে নিন

### 1.3 GitHub রিপোজিটরি সংযুক্ত করুন
1. আপনার GitHub অ্যাকাউন্ট অনুমোদন করুন
2. `Bayojid-AI-Pro` রিপোজিটরি খুঁজুন এবং সিলেক্ট করুন
3. **Connect** ক্লিক করুন

## ধাপ 2: Web Service সেটিংস কনফিগার করুন

### 2.1 মৌলিক তথ্য
| সেটিং | মান |
|-------|-----|
| **Name** | `bayojid-ai-pro` |
| **Environment** | `Node` |
| **Region** | আপনার কাছাকাছি অঞ্চল বেছে নিন |
| **Branch** | `main` |

### 2.2 বিল্ড এবং স্টার্ট কমান্ড

**Build Command:**
```bash
pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

### 2.3 Environment Variables যোগ করুন

Render ড্যাশবোর্ডে **Environment** সেকশনে এই ভেরিয়েবলগুলো যোগ করুন:

```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your_jwt_secret_key
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Bayojid
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASS=your_store_password
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

## ধাপ 3: ডাটাবেস সেটআপ

### 3.1 MySQL ডাটাবেস তৈরি করুন

**অপশন A: Render MySQL (সহজ)**
1. Render ড্যাশবোর্ডে **New +** ক্লিক করুন
2. **MySQL** সিলেক্ট করুন
3. নাম দিন: `bayojid-ai-pro-db`
4. **Create** ক্লিক করুন
5. সংযোগ স্ট্রিং কপি করুন এবং `DATABASE_URL` এ পেস্ট করুন

**অপশন B: বাহ্যিক ডাটাবেস**
- আপনার বিদ্যমান MySQL সার্ভার ব্যবহার করুন
- সংযোগ স্ট্রিং: `mysql://username:password@host:port/database`

### 3.2 ডাটাবেস মাইগ্রেশন চালান

ডিপ্লয়মেন্টের পর, ডাটাবেস স্কিমা তৈরি করতে:

```bash
pnpm db:push
```

## ধাপ 4: ডিপ্লয় করুন

### 4.1 ডিপ্লয় শুরু করুন
1. সমস্ত সেটিংস যাচাই করুন
2. **Create Web Service** ক্লিক করুন
3. Render আপনার অ্যাপ্লিকেশন বিল্ড এবং ডিপ্লয় করবে

### 4.2 ডিপ্লয়মেন্ট পর্যবেক্ষণ করুন
- **Logs** ট্যাবে বিল্ড প্রক্রিয়া দেখুন
- ত্রুটি থাকলে ঠিক করুন এবং পুনরায় ডিপ্লয় করুন

### 4.3 লাইভ URL পান
ডিপ্লয়মেন্ট সম্পূর্ণ হলে, আপনার অ্যাপ এই URL-এ উপলব্ধ থাকবে:
```
https://bayojid-ai-pro.onrender.com
```

## ধাপ 5: কাস্টম ডোমেইন সেটআপ (ঐচ্ছিক)

### 5.1 ডোমেইন সংযুক্ত করুন
1. Render ড্যাশবোর্ডে আপনার সেবা খুলুন
2. **Settings** → **Custom Domain** এ যান
3. আপনার ডোমেইন যোগ করুন
4. DNS রেকর্ড আপডেট করুন (Render নির্দেশনা অনুসরণ করুন)

## ধাপ 6: SSL সার্টিফিকেট

Render স্বয়ংক্রিয়ভাবে SSL সার্টিফিকেট প্রদান করে। কোনো অতিরিক্ত কনফিগারেশনের প্রয়োজন নেই।

## সমস্যা সমাধান

### সমস্যা 1: বিল্ড ব্যর্থ হয়েছে

**সমাধান:**
1. Logs ট্যাবে ত্রুটি বার্তা দেখুন
2. স্থানীয়ভাবে `pnpm install && pnpm build` চালান
3. সমস্যা ঠিক করুন এবং GitHub-এ পুশ করুন
4. Render স্বয়ংক্রিয়ভাবে পুনরায় ডিপ্লয় করবে

### সমস্যা 2: ডাটাবেস সংযোগ ব্যর্থ

**সমাধান:**
1. `DATABASE_URL` সঠিক কিনা যাচাই করুন
2. ডাটাবেস সার্ভার চলছে কিনা চেক করুন
3. ফায়ারওয়াল নিয়ম যাচাই করুন

### সমস্যা 3: পোর্ট সমস্যা

**সমাধান:**
- Render স্বয়ংক্রিয়ভাবে পোর্ট 3000 ব্যবহার করে
- আপনার অ্যাপ পরিবেশ ভেরিয়েবল থেকে পোর্ট পড়ে নিশ্চিত করুন

## পরবর্তী পদক্ষেপ

1. ✅ ডিপ্লয়মেন্ট যাচাই করুন
2. ✅ SSL সার্টিফিকেট কাজ করছে কিনা চেক করুন
3. ✅ ডাটাবেস মাইগ্রেশন চালান
4. ✅ পেমেন্ট গেটওয়ে সেটআপ করুন
5. ✅ ইমেল সেবা কনফিগার করুন

## সহায়ক লিংক

- [Render ডকুমেন্টেশন](https://render.com/docs)
- [Node.js ডিপ্লয়মেন্ট গাইড](https://render.com/docs/deploy-node)
- [পরিবেশ ভেরিয়েবল](https://render.com/docs/environment-variables)
- [কাস্টম ডোমেইন](https://render.com/docs/custom-domains)

---

**প্রশ্ন বা সমস্যা থাকলে Render সাপোর্টে যোগাযোগ করুন।** 📧
