# API Integration Guide - Bayojid AI Pro

## Overview

This guide explains how to integrate external AI models and payment gateways into your Bayojid AI Pro platform. The system is designed to work with or without these integrations - you can add them anytime.

## AI Models Integration

### Supported Models

| Model | Provider | Status | Environment Variable |
|-------|----------|--------|----------------------|
| GPT-4 | OpenAI | Ready | `OPENAI_API_KEY` |
| GPT-5 | OpenAI | Ready | `GPT5_API_KEY` |
| Claude Mythos | Anthropic | Ready | `CLAUDE_MYTHOS_API_KEY` |
| Grok | xAI | Ready | `GROK_API_KEY` |
| Gemini 3 | Google | Ready | `GEMINI_API_KEY` |
| Perplexity | Perplexity AI | Ready | `PERPLEXITY_API_KEY` |
| Manus AI | Manus | Pre-configured | `BUILT_IN_FORGE_API_KEY` |

### How to Add AI Model API Keys

1. **Obtain API Key** from the model provider:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com
   - xAI: https://x.ai/api
   - Google: https://makersuite.google.com
   - Perplexity: https://www.perplexity.ai/api
   - Manus: Already configured

2. **Add to Environment Variables** via Management UI:
   - Go to Settings → Secrets
   - Add the API key with the corresponding environment variable name
   - The system will automatically detect and enable the model

3. **Verify Configuration**:
   - Visit `/api/ai-models/status` to see all configured models
   - Only models with valid API keys will be available for use

### Example: Adding GPT-5 API Key

```bash
# In Management UI → Settings → Secrets:
Key: GPT5_API_KEY
Value: sk_test_your_gpt5_key_here
```

After adding, the model will automatically appear in:
- AI Model Selector UI
- Model comparison tables
- Recommendations system

## Payment Gateway Integration

### Supported Payment Gateways

| Gateway | Region | Status | Environment Variables |
|---------|--------|--------|----------------------|
| Stripe | Global | Ready | `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` |
| SSLCommerz | Bangladesh | Ready | `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASS` |
| PayPal | Global | Ready | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |
| Razorpay | India | Ready | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |

### How to Add Payment Gateway

1. **Create Account** with payment provider:
   - Stripe: https://dashboard.stripe.com
   - SSLCommerz: https://www.sslcommerz.com
   - PayPal: https://www.paypal.com/business
   - Razorpay: https://razorpay.com

2. **Get API Credentials**:
   - Each provider gives you a publishable key and secret key
   - Keep secret keys private!

3. **Add to Environment Variables** via Management UI:
   - Go to Settings → Secrets
   - Add both keys for the gateway
   - System will automatically enable the gateway

4. **Verify Configuration**:
   - Visit `/api/payment/gateways/status` to see all configured gateways
   - Only gateways with valid credentials will be active

### Example: Adding Stripe

```bash
# In Management UI → Settings → Secrets:
Key: STRIPE_PUBLISHABLE_KEY
Value: pk_test_your_stripe_key

Key: STRIPE_SECRET_KEY
Value: sk_test_your_stripe_secret
```

## Subscription Plans

The platform includes 4 subscription tiers:

### Free Plan
- **Price**: $0/month
- **Video**: 10 min/month
- **Images**: 5/month
- **Storage**: 1 GB
- **Projects**: 3
- **Support**: Community

### Starter Plan
- **Price**: $9.99/month
- **Video**: 60 min/month
- **Images**: 50/month
- **Storage**: 10 GB
- **Projects**: 10
- **Support**: Email

### Pro Plan
- **Price**: $29.99/month
- **Video**: 500 min/month
- **Images**: 500/month
- **Storage**: 100 GB
- **Projects**: 50
- **Support**: Priority

### Enterprise Plan
- **Price**: $99.99/month
- **Video**: 5000 min/month
- **Images**: 5000/month
- **Storage**: 1000 GB
- **Projects**: 500
- **Support**: Dedicated

## System Architecture

### AI Model Routing

```
User Request
    ↓
Model Selector (User chooses model)
    ↓
AI Integration Framework
    ├─ Check if model is configured
    ├─ Get API key from environment
    ├─ Route to model API
    └─ Handle fallback if needed
    ↓
Response to User
```

### Payment Processing

```
User Upgrade Request
    ↓
Payment Router
    ├─ Select payment gateway
    ├─ Create payment intent
    ├─ Get payment credentials
    └─ Route to gateway API
    ↓
Payment Gateway
    ├─ Process payment
    ├─ Send webhook
    └─ Confirm transaction
    ↓
Update User Subscription
    ↓
Activate Premium Features
```

## Testing

### Test Mode (Before Adding Live Keys)

- All API calls return mock responses
- No actual charges occur
- Perfect for development and testing
- All features work normally with test data

### Live Mode (After Adding API Keys)

- Real API calls to payment gateways
- Real charges to user accounts
- Full production functionality
- Webhooks enabled for real-time updates

## Troubleshooting

### Model Not Appearing in Selector

**Problem**: Added API key but model doesn't show up

**Solution**:
1. Check if environment variable is set correctly
2. Restart the server (Settings → Restart)
3. Verify API key format matches provider requirements
4. Check `/api/ai-models/status` endpoint

### Payment Gateway Not Working

**Problem**: Payment fails or gateway not available

**Solution**:
1. Verify both API keys are added (publishable + secret)
2. Check if gateway is in test or live mode
3. Ensure webhook URLs are configured in gateway dashboard
4. Check `/api/payment/gateways/status` endpoint

### API Key Rejected

**Problem**: "Invalid API key" error

**Solution**:
1. Double-check the API key value (copy-paste carefully)
2. Verify key hasn't expired or been revoked
3. Ensure you're using the correct key type (publishable vs secret)
4. Check provider's documentation for key format

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** for security
4. **Monitor API usage** for unusual activity
5. **Use webhook signatures** to verify payment events
6. **Enable 2FA** on all provider accounts
7. **Keep keys private** - never share or expose them

## Support

For issues with:
- **AI Models**: Contact the respective model provider
- **Payment Gateways**: Contact the gateway support
- **Platform Integration**: Check logs at `/api/logs`

## Next Steps

1. ✅ Platform is ready for API integration
2. 📝 Add AI model API keys when available
3. 💳 Add payment gateway credentials when ready
4. 🧪 Test in test mode before going live
5. 🚀 Deploy to production with live credentials
