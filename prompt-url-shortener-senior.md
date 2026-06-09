# PROMPT SENIOR — URL Shortener API with Analytics
## Deploy 100% gratuito: Render + MongoDB Atlas + Upstash Redis

---

You are a senior backend engineer with 10+ years of experience building production-grade Node.js APIs. Your code is clean, well-structured, and follows industry best practices. No boilerplate fluff — only deliberate, justified decisions.

---

## PROJECT: URL Shortener API with Click Analytics

### Description
A production-ready REST API that shortens URLs and tracks detailed click analytics per shortened link. Built to demonstrate real-world backend architecture: clean layered structure, async processing, caching strategy, and structured error handling.

Deployed for free using **Render** (app hosting) + **MongoDB Atlas** (database) + **Upstash Redis** (cache + rate limiting).

---

### Tech Stack
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB Atlas (free tier, 512MB) via Mongoose
- **Cache / Rate Limiting:** Upstash Redis (free tier, 10k req/day) via `@upstash/redis`
- **Auth:** JWT — access token (15min) + refresh token (7d, httpOnly cookie)
- **Validation:** Zod
- **Docs:** Swagger/OpenAPI 3.0 via swagger-jsdoc + swagger-ui-express
- **Testing:** Vitest + Supertest
- **Local Dev:** Docker + docker-compose (MongoDB + Redis local)
- **Deploy:** Render (free tier) — zero config, connect GitHub repo

---

### Core Features

#### 1. Auth System
- `POST /auth/register`
- `POST /auth/login` → returns access token + refresh token (httpOnly cookie)
- `POST /auth/refresh` → rotates refresh token
- `POST /auth/logout` → invalidates refresh token in DB

#### 2. URL Management (authenticated)
- `POST /urls` → create short URL with optional custom slug and expiration date
- `GET /urls` → list all URLs for the authenticated user (paginated)
- `GET /urls/:id` → get single URL with aggregated analytics summary
- `DELETE /urls/:id` → soft delete

#### 3. Redirect (public)
- `GET /:shortCode` → redirect to original URL
- On each visit: log click event **asynchronously** (do NOT block the redirect)
- Capture per click: timestamp, hashed IP (SHA-256, for privacy), user-agent parsed (device type, browser, OS), referer, country via `ip-api.com` (free, no key required)

#### 4. Analytics (authenticated)
- `GET /urls/:id/analytics?from=&to=&groupBy=day|week|month`
- Returns: total clicks, unique clicks (by hashed IP), breakdown by device, browser, OS, country, referrer
- Aggregation handled at DB layer (MongoDB `$group` pipeline)

#### 5. Rate Limiting (Upstash Redis)
- Redirect endpoint: 60 req/min per IP
- Auth endpoints: 10 req/min per IP
- Use `@upstash/ratelimit` — serverless-compatible, works perfectly on Render free tier

---

### Project Architecture

Follow a clean 3-layer architecture:

```
src/
├── config/
│   ├── env.ts          # Zod validation of all env vars at startup
│   ├── db.ts           # MongoDB Atlas connection
│   └── redis.ts        # Upstash Redis client
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   └── auth.schema.ts      # Zod schemas
│   ├── urls/
│   │   ├── url.controller.ts
│   │   ├── url.service.ts
│   │   ├── url.repository.ts
│   │   ├── url.routes.ts
│   │   └── url.schema.ts
│   └── analytics/
│       ├── analytics.controller.ts
│       ├── analytics.service.ts
│       ├── analytics.repository.ts
│       └── analytics.routes.ts
├── shared/
│   ├── middleware/
│   │   ├── errorHandler.ts     # Centralized error handler
│   │   ├── authenticate.ts     # JWT middleware
│   │   └── rateLimiter.ts      # Upstash rate limiter
│   ├── utils/
│   │   ├── asyncWrapper.ts     # Wraps async controllers, no try/catch noise
│   │   ├── slugGenerator.ts    # nanoid-based short code generator
│   │   ├── ipHasher.ts         # SHA-256 hashing for IP privacy
│   │   └── AppError.ts         # Custom error class (statusCode, isOperational)
│   └── types/
│       └── index.ts
├── app.ts
└── server.ts
```

**Layer rules:**
- Controllers: HTTP in/out only, zero business logic
- Services: all business logic, zero DB calls
- Repositories: all DB queries, return plain objects (not Mongoose documents)

---

### Code Standards

- TypeScript strict mode throughout — no `any`, no unused imports
- Every async route wrapped in `asyncWrapper` — no try/catch in controllers
- Centralized error handler using `AppError(message, statusCode, isOperational)`
- Zod schemas co-located with each module, reused for validation and type inference
- All env vars validated with Zod at startup — fail fast if missing
- Consistent response envelope across all endpoints:
  ```json
  { "success": true, "data": {}, "meta": {}, "error": null }
  ```
- ESLint + Prettier enforced

---

### Environment Variables

```env
# App
NODE_ENV=production
PORT=10000

# Auth
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# MongoDB Atlas (free tier)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/urlshortener

# Upstash Redis (free tier) — use REST API, NOT ioredis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# App base URL (used to generate short links)
BASE_URL=https://your-app.onrender.com
```

**Important:** Upstash on Render requires the REST client (`@upstash/redis`), NOT ioredis.
Use `@upstash/ratelimit` for rate limiting — same credentials, fully compatible.

---

### Docker Compose (local development only)

```yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    depends_on:
      - mongo
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

```env
# .env.local (for docker-compose local dev)
NODE_ENV=development
PORT=3000
JWT_ACCESS_SECRET=dev_access_secret
JWT_REFRESH_SECRET=dev_refresh_secret
MONGODB_URI=mongodb://mongo:27017/urlshortener
REDIS_URL=redis://redis:6379
BASE_URL=http://localhost:3000
```

For local dev, use ioredis with `REDIS_URL`. For production (Render), switch to `@upstash/redis` REST client via `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.

Abstract the Redis client behind `src/config/redis.ts` so the switch is transparent to the rest of the codebase.

---

### Render Deploy Config

Create a `render.yaml` in the project root:

```yaml
services:
  - type: web
    name: url-shortener-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: UPSTASH_REDIS_REST_URL
        sync: false
      - key: UPSTASH_REDIS_REST_TOKEN
        sync: false
      - key: JWT_ACCESS_SECRET
        sync: false
      - key: JWT_REFRESH_SECRET
        sync: false
      - key: BASE_URL
        sync: false
```

`sync: false` = you set the value manually in the Render dashboard (keeps secrets out of the repo).

---

### Free Services Setup — Step by Step

**MongoDB Atlas**
1. atlas.mongodb.com → crear cuenta gratuita
2. Create cluster → M0 Free Tier (512MB, permanente)
3. Database Access → crear usuario con password
4. Network Access → Allow from anywhere (`0.0.0.0/0`) para Render
5. Connect → Drivers → copiar connection string → reemplazar `<password>`

**Upstash Redis**
1. console.upstash.com → crear cuenta gratuita
2. Create Database → región US-East-1 (más cercana a Render Oregon)
3. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` del dashboard
4. Free tier: 10,000 req/día, 256MB — suficiente para portfolio

**Render**
1. render.com → crear cuenta gratuita, conectar GitHub
2. New Web Service → seleccionar el repo
3. Render detecta `render.yaml` automáticamente
4. Agregar env vars manualmente en el dashboard
5. Deploy automático en cada push a `main`

**Nota sobre cold start:** El free tier de Render suspende la app tras 15min sin tráfico. El primer request tarda ~30seg en despertar. Para portfolio es aceptable. Si querés evitarlo, agregá un cron job gratuito en cron-job.org que haga ping a `/health` cada 10min.

---

### README Requirements

El README debe incluir:

1. **Descripción** — 2 oraciones, sin filler
2. **Live Demo** — link a Render + link a Swagger UI (`/api/docs`)
3. **Diagrama de arquitectura** — ASCII o Mermaid
4. **Setup local** — `docker-compose up` como único comando
5. **Stack badges** — Node.js, TypeScript, MongoDB, Redis, Render
6. **Design decisions** — por qué cada herramienta (muestra criterio)
7. **What I'd add with more time** — muestra madurez de ingeniería

---

### What makes this portfolio-worthy

- Demuestra: auth patterns, async architecture, caching, analytics aggregation, clean layered structure, testing, Docker, API docs
- Scope cerrado — se puede terminar completamente
- Deploy en vivo demostrable — el recruiter o cliente puede usar la API desde Swagger
- Decisiones técnicas justificables en una entrevista
- Stack 100% gratuito — sin tarjeta, sin vencimiento

---

## BUILD ORDER

Build this step by step in this exact order. Show me the complete code for each step before moving to the next:

1. Project scaffolding — tsconfig, eslint, prettier, folder structure, `app.ts`, `server.ts`
2. Config layer — `env.ts` (Zod validation), `db.ts` (Atlas), `redis.ts` (Upstash/local abstraction)
3. Shared utilities — `AppError`, `asyncWrapper`, `slugGenerator`, `ipHasher`
4. Auth module — register, login, refresh, logout
5. URLs module — CRUD completo
6. Redirect endpoint — con async click logging
7. Analytics module — aggregation pipeline
8. Rate limiting middleware — Upstash ratelimit
9. Swagger docs — all routes documented
10. Tests — integration tests para auth y urls
11. Docker + render.yaml — deploy config

Ask me before moving to the next step.
