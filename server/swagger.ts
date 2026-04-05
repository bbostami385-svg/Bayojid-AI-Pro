/**
 * Swagger API Documentation Configuration
 * Generates OpenAPI/Swagger documentation for all API endpoints
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bayojid AI Pro API',
      version: '1.0.0',
      description: 'Complete API documentation for Bayojid AI Pro - Multi-AI Chat Platform with Advanced Analytics and Payment Integration',
      contact: {
        name: 'Bayojid AI Pro Support',
        email: 'support@bayojid-ai.com',
        url: 'https://bayojid-ai.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server',
      },
      {
        url: 'https://api.bayojid-ai.com',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for authentication',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for service-to-service authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Error code',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'User ID',
            },
            email: {
              type: 'string',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Conversation ID',
            },
            userId: {
              type: 'number',
              description: 'User ID',
            },
            title: {
              type: 'string',
              description: 'Conversation title',
            },
            model: {
              type: 'string',
              enum: ['chatgpt', 'gemini', 'claude', 'perplexity', 'grok'],
              description: 'AI model used',
            },
            messageCount: {
              type: 'number',
              description: 'Number of messages in conversation',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Conversation creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Payment ID',
            },
            userId: {
              type: 'number',
              description: 'User ID',
            },
            amount: {
              type: 'number',
              description: 'Payment amount',
            },
            currency: {
              type: 'string',
              description: 'Currency code',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: 'Payment status',
            },
            method: {
              type: 'string',
              enum: ['stripe', 'sslcommerz'],
              description: 'Payment method',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Payment creation date',
            },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Subscription ID',
            },
            userId: {
              type: 'number',
              description: 'User ID',
            },
            plan: {
              type: 'string',
              enum: ['basic', 'pro', 'premium'],
              description: 'Subscription plan',
            },
            status: {
              type: 'string',
              enum: ['active', 'paused', 'cancelled'],
              description: 'Subscription status',
            },
            renewalDate: {
              type: 'string',
              format: 'date-time',
              description: 'Next renewal date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Subscription creation date',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/routers.ts', './server/stripeRouter.ts', './server/aiModelsRouter.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * Swagger UI configuration
 */
export const swaggerUIOptions = {
  customCss: `
    .swagger-ui .topbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .swagger-ui .info .title {
      color: #667eea;
    }
    .swagger-ui .btn-authorize {
      background: #667eea;
    }
    .swagger-ui .btn-authorize:hover {
      background: #764ba2;
    }
  `,
  customSiteTitle: 'Bayojid AI Pro - API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
  },
};

/**
 * API Documentation endpoints
 */
export const API_DOCS = {
  '/api/docs': 'Swagger UI',
  '/api/docs.json': 'OpenAPI JSON specification',
  '/api/docs.yaml': 'OpenAPI YAML specification',
};

/**
 * Generate API documentation summary
 */
export function getAPIDocumentationSummary() {
  return {
    title: 'Bayojid AI Pro API',
    version: '1.0.0',
    description: 'Complete REST API for Bayojid AI Pro platform',
    baseUrl: 'https://api.bayojid-ai.com',
    authentication: 'Bearer JWT Token',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
      },
      conversations: {
        list: 'GET /api/conversations',
        create: 'POST /api/conversations',
        get: 'GET /api/conversations/:id',
        update: 'PUT /api/conversations/:id',
        delete: 'DELETE /api/conversations/:id',
      },
      messages: {
        send: 'POST /api/conversations/:id/messages',
        list: 'GET /api/conversations/:id/messages',
      },
      aiModels: {
        list: 'GET /api/ai-models',
        chat: 'POST /api/ai-models/chat',
        compare: 'POST /api/ai-models/compare',
      },
      payments: {
        createCheckout: 'POST /api/payments/checkout',
        history: 'GET /api/payments/history',
        invoice: 'GET /api/payments/invoices/:id',
      },
      subscriptions: {
        current: 'GET /api/subscriptions/current',
        upgrade: 'POST /api/subscriptions/upgrade',
        cancel: 'POST /api/subscriptions/cancel',
      },
      analytics: {
        dashboard: 'GET /api/analytics/dashboard',
        conversations: 'GET /api/analytics/conversations',
        revenue: 'GET /api/analytics/revenue',
      },
    },
    rateLimit: {
      requests: 1000,
      window: '1 hour',
      description: 'API rate limiting: 1000 requests per hour',
    },
    errorCodes: {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    },
  };
}
