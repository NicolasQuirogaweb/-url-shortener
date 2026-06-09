export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'URL Shortener API',
    version: '1.0.0',
    description: 'A production-ready REST API that shortens URLs and tracks detailed click analytics.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local development' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
            },
          },
        },
        responses: {
          '201': { description: 'User registered' },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        responses: {
          '200': { description: 'Token refreshed' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Logged out' },
        },
      },
    },
    '/urls': {
      post: {
        tags: ['URLs'],
        summary: 'Create a short URL',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUrlInput' },
            },
          },
        },
        responses: {
          '201': { description: 'Short URL created' },
        },
      },
      get: {
        tags: ['URLs'],
        summary: 'List user URLs',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer' },
            description: 'Page number',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer' },
            description: 'Items per page',
          },
        ],
        responses: {
          '200': { description: 'List of URLs' },
        },
      },
    },
    '/urls/{id}': {
      get: {
        tags: ['URLs'],
        summary: 'Get URL by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'URL details' },
          '404': { description: 'URL not found' },
        },
      },
      delete: {
        tags: ['URLs'],
        summary: 'Soft delete a URL',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'URL deleted' },
          '404': { description: 'URL not found' },
        },
      },
    },
    '/{shortCode}': {
      get: {
        tags: ['Redirect'],
        summary: 'Redirect to original URL',
        parameters: [
          {
            in: 'path',
            name: 'shortCode',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '302': { description: 'Redirect to original URL' },
          '404': { description: 'URL not found' },
          '410': { description: 'URL expired' },
        },
      },
    },
    '/urls/{id}/analytics': {
      get: {
        tags: ['Analytics'],
        summary: 'Get click analytics for a URL',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
          { in: 'query', name: 'from', schema: { type: 'string', format: 'date-time' } },
          { in: 'query', name: 'to', schema: { type: 'string', format: 'date-time' } },
          { in: 'query', name: 'groupBy', schema: { type: 'string', enum: ['day', 'week', 'month'] } },
        ],
        responses: {
          '200': { description: 'Analytics data' },
          '404': { description: 'URL not found' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      CreateUrlInput: {
        type: 'object',
        required: ['originalUrl'],
        properties: {
          originalUrl: { type: 'string', format: 'uri' },
          customSlug: { type: 'string', pattern: '^[a-zA-Z0-9_-]{4,16}$' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
      UrlResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          originalUrl: { type: 'string' },
          shortCode: { type: 'string' },
          shortUrl: { type: 'string' },
          clicks: { type: 'integer' },
          expiresAt: { type: 'string', nullable: true },
          createdAt: { type: 'string' },
        },
      },
    },
  },
};
