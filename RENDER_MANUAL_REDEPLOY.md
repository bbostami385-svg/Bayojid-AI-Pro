# Render Manual Redeploy Guide

## সমস্যা
Render এখনও পুরানো code চালাচ্ছে এবং `ReferenceError: bigint is not defined` error দেখাচ্ছে।

## সমাধান

### স্টেপ 1: Render Dashboard খুলুন
1. https://dashboard.render.com এ যান
2. আপনার "ai-chat-app" service খুঁজুন এবং ক্লিক করুন

### স্টেপ 2: Manual Redeploy করুন
1. Service page-এ যান
2. উপরের ডানদিকে "Manual Deploy" বাটন খুঁজুন (বা "Redeploy" বাটন)
3. ড্রপডাউন মেনু থেকে "Clear build cache & redeploy" বেছে নিন

### স্টেপ 3: Build সম্পন্ন হওয়ার জন্য অপেক্ষা করুন
- Build সাধারণত 5-10 মিনিট সময় নেয়
- "Logs" ট্যাবে progress দেখুন
- "Build successful" মেসেজ খুঁজুন

### স্টেপ 4: Logs চেক করুন
Build সম্পন্ন হওয়ার পর:
- "Logs" ট্যাবে "Server running on" মেসেজ খুঁজুন
- কোনো error message নেই কিনা যাচাই করুন

### স্টেপ 5: Application Test করুন
```bash
curl https://bayojid-ai-pro.onrender.com/api/health
```

এটি একটি JSON response দেবে যদি application সফলভাবে চলছে।

## সাধারণ সমস্যা

### Build এখনও ব্যর্থ হচ্ছে?
- Render Dashboard → Settings → Clear build cache
- তারপর আবার Manual Redeploy করুন

### কোনো response নেই?
- Render Dashboard → Logs চেক করুন
- Error message খুঁজুন এবং আমাকে জানান

## দ্রুত লিংক
- Render Dashboard: https://dashboard.render.com
- Service Logs: https://dashboard.render.com/services/bayojid-ai-pro
