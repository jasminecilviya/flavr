# Flavr — High-Level Design

> **Scope:** System architecture, component relationships, data flow, infrastructure.

---

## 1. System Overview

Flavr is a monolithic MERN application deployed as a single Docker container. The Express server serves both the REST API and the pre-built React SPA. MongoDB Atlas provides the data layer, and external services handle AI inference and payment processing.

### Core Capabilities

- **Food Catalog** — 30+ dishes across 3 restaurants, categorized and taggable
- **User Management** — JWT-based auth with role-based access (user/admin)
- **Shopping Cart** — Server-side cart with quantity management
- **Order Processing** — Stripe integration with demo fallback
- **AI Recommendations** — Multi-turn conversational AI with meal planning
- **Coupons & Promotions** — Configurable discount codes
- **Admin Dashboard** — Analytics, order management, content management

### Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Response time (API) | < 200ms (p95) |
| Response time (AI) | < 3s (p95) including Mistral API |
| Availability | 99.9% (Railway SLA) |
| Concurrency | 100 simultaneous users |
| Data persistence | MongoDB Atlas automated backups |

---

## 2. Component Architecture

```
┌──────────────────────────────────────────────────┐
│                    Client                        │
│  ┌──────────────┐  ┌──────────────┐              │
│  │  Browser SPA │  │  Mobile App  │              │
│  │  (React)     │  │  (Future)    │              │
│  └──────┬───────┘  └──────┬───────┘              │
└─────────┼──────────────────┼──────────────────────┘
          │                  │
          ▼                  ▼
┌──────────────────────────────────────────────────┐
│               Express API (Server)                │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Middleware Pipeline                         │ │
│  │  cors → json → auth → router → errorHandler  │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │
│  │ Auth │ │ Dish │ │ Cart │ │Order │ │  AI    │ │
│  │ Ctrl │ │ Ctrl │ │ Ctrl │ │Ctrl  │ │ Ctrl   │ │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └───┬────┘ │
│     │        │         │        │          │      │
│     ▼        ▼         ▼        ▼          ▼      │
│  ┌──────────────────────────────────────────────┐ │
│  │           Mongoose Models (9)                │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## 3. Database Schema Relationships

```
User (1) ───────< (N) Order
User (1) ───────< (N) Favorite
User (1) ───────< (N) Review
User (1) ───────< (1) Cart

Restaurant (1) ──< (N) Menu
Restaurant (1) ──< (N) Dish

Menu (1) ───────< (N) Dish

Order (1) ──────< (N) Order.items
Order.items ────── (1) Dish
```

## 4. External Integrations

| Service | Purpose | Integration Pattern |
|---------|---------|-------------------|
| MongoDB Atlas | Primary database | Mongoose ODM (direct connection) |
| Mistral AI | AI recommendations | OpenAI-compatible REST API |
| Stripe | Payment processing | Checkout Sessions API |
| Cloudinary | Image upload (optional) | Multer storage adapter |

## 5. Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Monolith over microservices** | Single developer, simple deployment, no network overhead |
| **MongoDB over PostgreSQL** | Flexible schema for varied dish attributes, faster iteration |
| **Server-side cart** | Persists across devices, enables abandoned cart recovery |
| **SSE over WebSocket for AI** | Simpler infrastructure, unidirectional streaming, HTTP/2 compatible |
| **Tailwind over styled-components** | Smaller bundle, consistent design system, rapid prototyping |
