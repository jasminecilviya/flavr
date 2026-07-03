# Flavr — System Architecture

> **Version:** 3.0.0 | **Last Updated:** July 2026

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌───────────────────┐  ┌──────────────────┐                │
│  │   React SPA       │  │   Mobile/3rd     │                │
│  │   (Vite + Tailwind│  │   Party via REST │                │
│  │    + Framer)      │  │   API            │                │
│  └────────┬──────────┘  └────────┬─────────┘                │
└───────────┼──────────────────────┼───────────────────────────┘
            │                      │
            │   HTTPS / JWT Bearer │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Express.js Middleware Stack                             │ │
│  │  CORS → JSON Parse → Auth(JWT) → Rate Limit → Router    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Auth     │ │ Dish     │ │ Order    │ │ AI            │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service       │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────┬───────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │          │
│  │ Cart     │ │ Payment  │ │ Admin    │        │          │
│  │ Service  │ │(Stripe)  │ │ Service  │        │          │
│  └──────────┘ └──────────┘ └──────────┘        │          │
└─────────────────────────────────────────────────┼──────────┘
                          │                       │
                          ▼                       ▼
┌─────────────────────────────────┐  ┌────────────────────────┐
│       Data Layer                │  │   External Services    │
│  ┌───────────────────────────┐  │  │  ┌──────────────────┐ │
│  │   MongoDB Atlas           │  │  │  │ Mistral AI API   │ │
│  │   (9 Collections)         │  │  │  │ (OpenAI Compat.) │ │
│  │                           │  │  │  └──────────────────┘ │
│  │   - User                  │  │  │  ┌──────────────────┐ │
│  │   - Restaurant            │  │  │  │ Stripe Payments  │ │
│  │   - Menu                  │  │  │  └──────────────────┘ │
│  │   - Dish                  │  │  │  ┌──────────────────┐ │
│  │   - Cart                  │  │  │  │ Cloudinary CDN   │ │
│  │   - Order                 │  │  │  └──────────────────┘ │
│  │   - Favorite              │  │  └────────────────────────┘
│  │   - Review                │  │
│  │   - Coupon                │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## 2. Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Railway (Single Container)          │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  Docker Container (node:20-slim)          │  │
│  │                                           │  │
│  │  Express Server :8080                     │  │
│  │  ├── REST API (/api/*)                    │  │
│  │  └── Static Files (public/index.html)     │  │
│  │                                           │  │
│  │  Healthcheck: GET /api/health             │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  MongoDB Atlas (M0 Free Tier)                    │
│  External: Stripe API, Mistral API               │
└─────────────────────────────────────────────────┘
```

## 3. Request Lifecycle

```
Client Request
    │
    ▼
1. Express parses JSON body & URL params
    │
    ▼
2. CORS check → Authentication (JWT extraction)
    │
    ▼
3. Route matching → Auth middleware (if protected)
    │
    ▼
4. Controller handles business logic
    │
    ├── DB queries via Mongoose models
    ├── External API calls (Stripe, Mistral)
    │
    ▼
5. Response serialized as JSON
    │
    ▼
6. Error handler catches any thrown exceptions
```

## 4. Data Flow — Order Placement

```
User adds items → Cart (server-side)
        │
        ▼
User checks out → Order created (status: Pending)
        │
        ├── Stripe keys present? → Stripe Checkout Session
        │       │                     │
        │       │                     ▼
        │       │              User redirected to Stripe
        │       │              On success → status: Preparing
        │       │
        └── No Stripe? → Demo mode
                            │
                            ▼
                    Auto-approved (status: Preparing)
                    Coupon usage incremented
```

## 5. AI Service Architecture

```
User Prompt
    │
    ▼
buildContext() — fetches user profile, preferences,
                 allergies, order history, menu
    │
    ▼
buildSystemPrompt() — constructs prompt with rules
    │
    ├── Language-specific system suffix
    ├── Budget extraction (regex)
    ├── Preference/Allergy awareness
    │
    ▼
OpenAI-compatible API call (streaming or single)
    │
    ├── Success → Streamed/Full response
    │
    └── Failure → Local fallback (keyword matching)
                    │
                    ▼
            Preference-boosted sort → Top 4 results
```

## 6. Security Boundaries

- **JWT tokens** — Signed with secret, 30-day expiry
- **Password storage** — bcrypt (12 salt rounds), field excluded from queries
- **Role-based access** — `admin` role required for admin endpoints
- **OIDC Federation** — Available for Vercel deployments
- **Input validation** — Mongoose schema validation + express middleware
- **Error handling** — Global error handler, no stack leaks in production

## 7. Performance Considerations

- **Database indexes** — All foreign keys indexed automatically by Mongoose
- **Population strategy** — `.populate()` limited to needed fields
- **AI streaming** — SSE reduces perceived latency
- **Static serving** — Express serves pre-built assets with caching headers
- **Connection pooling** — Mongoose default pool (100 connections)
