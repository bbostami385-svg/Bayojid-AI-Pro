# Firebase সম্পূর্ণ সেটআপ গাইড - Bayojid AI Pro

এই গাইড আপনার AI Chat অ্যাপ্লিকেশনে Firebase এর সমস্ত ফিচার ইন্টিগ্রেট করার জন্য সম্পূর্ণ নির্দেশনা প্রদান করে।

## প্রয়োজনীয় জিনিস

- ✅ Google অ্যাকাউন্ট
- ✅ Firebase প্রজেক্ট (Bayojid AI pro)
- ✅ Node.js এবং npm/pnpm

## ধাপ 1: Firebase প্রজেক্ট তৈরি করুন

### 1.1 Firebase কনসোলে যান
```
https://console.firebase.google.com
```

### 1.2 নতুন প্রজেক্ট তৈরি করুন
1. **Create Project** ক্লিক করুন
2. প্রজেক্ট নাম: `Bayojid AI pro`
3. Google Analytics সক্ষম করুন (ঐচ্ছিক)
4. **Create Project** ক্লিক করুন

### 1.3 Firebase SDK ডাউনলোড করুন
1. প্রজেক্ট সেটিংসে যান
2. **Service Account** ট্যাব খুলুন
3. **Generate New Private Key** ক্লিক করুন
4. JSON ফাইল ডাউনলোড করুন এবং নিরাপদে সংরক্ষণ করুন

## ধাপ 2: Firebase Authentication সেটআপ

### 2.1 Authentication সক্ষম করুন
1. Firebase কনসোলে **Authentication** ক্লিক করুন
2. **Get Started** ক্লিক করুন
3. **Sign-in method** ট্যাবে যান

### 2.2 সাইন-ইন পদ্ধতি সক্ষম করুন

**Email/Password:**
1. **Email/Password** ক্লিক করুন
2. **Enable** টগল চালু করুন
3. **Save** ক্লিক করুন

**Google Sign-In:**
1. **Google** ক্লিক করুন
2. **Enable** টগল চালু করুন
3. সাপোর্ট ইমেল দিন
4. **Save** ক্লিক করুন

**GitHub Sign-In (ঐচ্ছিক):**
1. **GitHub** ক্লিক করুন
2. **Enable** টগল চালু করুন
3. GitHub OAuth অ্যাপ তৈরি করুন
4. Client ID এবং Secret দিন
5. **Save** ক্লিক করুন

### 2.3 Firebase Admin SDK ইনস্টল করুন
```bash
pnpm add firebase-admin
```

### 2.4 Firebase Client SDK ইনস্টল করুন
```bash
pnpm add firebase
```

## ধাপ 3: Realtime Database সেটআপ

### 3.1 Realtime Database তৈরি করুন
1. Firebase কনসোলে **Realtime Database** ক্লিক করুন
2. **Create Database** ক্লিক করুন
3. লোকেশন বেছে নিন (আপনার কাছাকাছি)
4. নিরাপত্তা নিয়ম: **Start in test mode** (পরে পরিবর্তন করুন)
5. **Enable** ক্লিক করুন

### 3.2 নিরাপত্তা নিয়ম সেট করুন
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "conversations": {
      "$conversationId": {
        ".read": "root.child('conversations').child($conversationId).child('participants').child(auth.uid).exists()",
        ".write": "root.child('conversations').child($conversationId).child('participants').child(auth.uid).exists()"
      }
    },
    "messages": {
      "$messageId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

## ধাপ 4: Cloud Firestore সেটআপ

### 4.1 Cloud Firestore তৈরি করুন
1. Firebase কনসোলে **Cloud Firestore** ক্লিক করুন
2. **Create Database** ক্লিক করুন
3. লোকেশন বেছে নিন
4. নিরাপত্তা নিয়ম: **Start in test mode**
5. **Create** ক্লিক করুন

### 4.2 কালেকশন তৈরি করুন

**Users কালেকশন:**
```
Collection ID: users
Document ID: {userId}
Fields:
- email: string
- displayName: string
- photoURL: string
- createdAt: timestamp
- updatedAt: timestamp
- subscription: string (free/pro/premium)
```

**Conversations কালেকশন:**
```
Collection ID: conversations
Document ID: {conversationId}
Fields:
- title: string
- description: string
- ownerId: string
- participants: array
- createdAt: timestamp
- updatedAt: timestamp
- isPublic: boolean
```

**Messages কালেকশন:**
```
Collection ID: messages
Document ID: {messageId}
Fields:
- conversationId: string
- userId: string
- content: string
- role: string (user/assistant)
- createdAt: timestamp
- reactions: map
```

### 4.3 নিরাপত্তা নিয়ম সেট করুন
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if request.auth.uid in resource.data.participants;
      allow write: if request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## ধাপ 5: Cloud Storage সেটআপ

### 5.1 Cloud Storage বাকেট তৈরি করুন
1. Firebase কনসোলে **Cloud Storage** ক্লিক করুন
2. **Get Started** ক্লিক করুন
3. নিরাপত্তা নিয়ম: **Start in test mode**
4. লোকেশন বেছে নিন
5. **Done** ক্লিক করুন

### 5.2 নিরাপত্তা নিয়ম সেট করুন
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Public files
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Conversation files
    match /conversations/{conversationId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 5.3 ফাইল আপলোড করুন
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const fileRef = ref(storage, `users/${userId}/profile.jpg`);
await uploadBytes(fileRef, file);
const url = await getDownloadURL(fileRef);
```

## ধাপ 6: Cloud Functions সেটআপ

### 6.1 Firebase CLI ইনস্টল করুন
```bash
npm install -g firebase-tools
```

### 6.2 Firebase CLI দিয়ে লগইন করুন
```bash
firebase login
```

### 6.3 Functions ইনিশিয়ালাইজ করুন
```bash
firebase init functions
```

### 6.4 ফাংশন তৈরি করুন

**ব্যবহারকারী তৈরির সময় Firestore ডকুমেন্ট তৈরি করুন:**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName || 'Anonymous',
    photoURL: user.photoURL || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    subscription: 'free'
  });
});

exports.deleteUserProfile = functions.auth.user().onDelete(async (user) => {
  const db = admin.firestore();
  
  await db.collection('users').doc(user.uid).delete();
});
```

**ইমেল পাঠানোর ফাংশন:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendWelcomeEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'স্বাগতম Bayojid AI Pro-তে!',
      html: `<h1>হ্যালো ${user.displayName}!</h1><p>আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</p>`
    });
  });
```

### 6.5 ফাংশন ডিপ্লয় করুন
```bash
firebase deploy --only functions
```

## ধাপ 7: Node.js অ্যাপ্লিকেশনে Firebase ইন্টিগ্রেট করুন

### 7.1 Firebase Admin SDK ইনিশিয়ালাইজ করুন
```javascript
// server/_core/firebase.ts
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const realtimeDb = admin.database();
```

### 7.2 tRPC রাউটার তৈরি করুন
```javascript
// server/firebaseRouter.ts
import { router, protectedProcedure } from "./_core/trpc";
import { db, auth, storage } from "./_core/firebase";
import { z } from "zod";

export const firebaseRouter = router({
  // ব্যবহারকারী প্রোফাইল পান
  getUserProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const doc = await db.collection('users').doc(ctx.user.id).get();
      return doc.data();
    }),

  // ব্যবহারকারী প্রোফাইল আপডেট করুন
  updateUserProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().optional(),
      photoURL: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      await db.collection('users').doc(ctx.user.id).update({
        ...input,
        updatedAt: new Date()
      });
      return { success: true };
    }),

  // কথোপকথন তৈরি করুন
  createConversation: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const docRef = await db.collection('conversations').add({
        title: input.title,
        description: input.description || '',
        ownerId: ctx.user.id,
        participants: [ctx.user.id],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id };
    }),

  // কথোপকথনের বার্তা পান
  getConversationMessages: protectedProcedure
    .input(z.object({
      conversationId: z.string()
    }))
    .query(async ({ input }) => {
      const snapshot = await db
        .collection('messages')
        .where('conversationId', '==', input.conversationId)
        .orderBy('createdAt', 'asc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    })
});
```

## ধাপ 8: Environment Variables সেট করুন

আপনার `.env` ফাইলে এই ভেরিয়েবলগুলো যোগ করুন:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
```

## ধাপ 9: ক্লায়েন্ট সাইড Firebase সেটআপ

### 9.1 Firebase কনফিগ তৈরি করুন
```javascript
// client/src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);
```

### 9.2 ক্লায়েন্ট Environment Variables যোগ করুন
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

## ধাপ 10: পরীক্ষা করুন

### 10.1 Authentication পরীক্ষা করুন
```javascript
import { signUp, signIn, signOut } from './auth';

// ব্যবহারকারী তৈরি করুন
await signUp('user@example.com', 'password123');

// লগইন করুন
await signIn('user@example.com', 'password123');

// লগআউট করুন
await signOut();
```

### 10.2 Firestore পরীক্ষা করুন
```javascript
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// ডকুমেন্ট যোগ করুন
const docRef = await addDoc(collection(db, 'users'), {
  name: 'John Doe',
  email: 'john@example.com'
});

// ডকুমেন্ট পান
const snapshot = await getDocs(collection(db, 'users'));
snapshot.forEach(doc => console.log(doc.data()));
```

## সমস্যা সমাধান

### সমস্যা 1: Authentication ব্যর্থ
- Firebase কনসোলে সাইন-ইন পদ্ধতি সক্ষম আছে কিনা চেক করুন
- API কী সঠিক কিনা যাচাই করুন

### সমস্যা 2: Firestore অনুমতি ত্রুটি
- নিরাপত্তা নিয়ম সঠিক কিনা চেক করুন
- ব্যবহারকারী Authentication করা আছে কিনা যাচাই করুন

### সমস্যা 3: Cloud Storage ত্রুটি
- বাকেট তৈরি করা হয়েছে কিনা চেক করুন
- নিরাপত্তা নিয়ম সঠিক কিনা যাচাই করুন

## পরবর্তী পদক্ষেপ

1. ✅ সব Firebase ফিচার সেটআপ করুন
2. ✅ নিরাপত্তা নিয়ম কনফিগার করুন
3. ✅ ক্লায়েন্ট সাইড ইন্টিগ্রেশন সম্পূর্ণ করুন
4. ✅ পরীক্ষা এবং ডিবাগিং করুন
5. ✅ প্রোডাকশনে ডিপ্লয় করুন

## সহায়ক লিংক

- [Firebase ডকুমেন্টেশন](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Client SDK](https://firebase.google.com/docs/web/setup)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Cloud Storage](https://firebase.google.com/docs/storage)

---

**প্রশ্ন বা সমস্যা থাকলে Firebase সাপোর্টে যোগাযোগ করুন।** 📧
