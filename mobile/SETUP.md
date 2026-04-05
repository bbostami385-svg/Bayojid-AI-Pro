# Bayojid AI Pro - React Native Mobile App

## Project Structure

```
mobile/
├── app/
│   ├── screens/
│   │   ├── ChatScreen.tsx
│   │   ├── ConversationListScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── PaymentScreen.tsx
│   ├── components/
│   │   ├── ChatMessage.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── VoiceRecorder.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useAIModels.ts
│   │   └── usePayments.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   ├── notifications.ts
│   │   └── analytics.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── AppNavigator.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── utils/
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── App.tsx
│   └── index.ts
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Setup Steps

```bash
# Install dependencies
npm install
# or
yarn install

# Install pods (iOS)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Key Features

### 1. Authentication
- OAuth2 integration with Bayojid AI Pro backend
- Secure token storage using React Native Keychain
- Biometric authentication (Face ID / Touch ID)
- Session management

### 2. Chat Interface
- Real-time message streaming
- Voice message recording and playback
- Image attachment support
- Message search and filtering
- Conversation history

### 3. AI Model Selection
- Easy model switching (ChatGPT, Gemini, Claude, etc.)
- Model performance metrics
- Cost estimation
- Favorite models

### 4. Payments
- In-app subscription management
- Payment method management
- Invoice history
- Subscription upgrade/downgrade

### 5. Offline Support
- Message caching
- Offline queue for messages
- Automatic sync when online

## API Integration

All API calls go through the shared backend at:
```
https://api.bayojid-ai.com
```

### Authentication Headers
```
Authorization: Bearer {JWT_TOKEN}
X-App-Version: 1.0.0
X-Platform: ios|android
```

## State Management

Using Redux Toolkit for state management:
- Auth state
- Chat state
- User preferences
- Payment state
- Notifications

## Performance Optimization

1. **Code Splitting**: Lazy load screens
2. **Image Optimization**: Compress and cache images
3. **Memory Management**: Proper cleanup in useEffect
4. **Bundle Size**: ~15-20MB after optimization

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## Deployment

### iOS
```bash
# Build for release
npm run build:ios

# Upload to App Store
# Use Xcode or Transporter
```

### Android
```bash
# Build APK
npm run build:android:apk

# Build AAB for Play Store
npm run build:android:aab

# Upload to Google Play Store
# Use Google Play Console
```

## Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=https://api.bayojid-ai.com
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_SSLCOMMERZ_STORE_ID=...
REACT_APP_ANALYTICS_ID=...
```

## Troubleshooting

### Common Issues

1. **Metro bundler not starting**
   ```bash
   npm start -- --reset-cache
   ```

2. **Pod installation fails (iOS)**
   ```bash
   cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
   ```

3. **Android build fails**
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Create Pull Request

## License

MIT

## Support

For support, email: support@bayojid-ai.com
