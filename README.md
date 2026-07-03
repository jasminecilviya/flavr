<p align="center">
  <a href="https://flavr.up.railway.app">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/status-live-ff6b00?style=flat-square">
      <img src="https://img.shields.io/badge/status-live-ff6b00?style=flat-square" alt="Live">
    </picture>
  </a>
  <a href="#"><img src="https://img.shields.io/badge/stack-MERN%2BAI-0A0F1E?style=flat-square" alt="Stack"></a>
  <a href="https://flavr.up.railway.app"><img src="https://img.shields.io/badge/demo-flavr.up.railway.app-ff6b00?style=flat-square" alt="Demo"></a>
</p>

# flavr

**AI-powered food discovery platform.** Personalized meal recommendations, real-time order tracking, and a full e-commerce experience.

---

## Quick Start

```bash
cp .env.example backend/.env   # set MONGO_URI, JWT_SECRET
npm run install:all
npm run seed                    # 30 dishes, 3 restaurants, 2 users, 3 coupons
npm run dev                     # backend :5000 + frontend :5173
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flavr.com | admin123 |
| User | priya@example.com | user123 |

---

## Features

| | |
|---|---|
| **AI Chef Studio** | Multi-turn chat with Mistral AI, SSE streaming, multilingual (EN/HI/TA), meal planner, budget detection, voice input |
| **Cart & Checkout** | Server-side cart, quantity controls, Stripe Checkout, coupon engine, demo mode |
| **Order Tracking** | 4-step timeline (Pending → Preparing → Out for Delivery → Delivered) |
| **Admin Panel** | Dashboard analytics, dish CRUD with image picker, order management, coupon administration |
| **UI/UX** | Dark mode, glassmorphism, Framer Motion, responsive, skeleton loaders |

---

## Tech Stack

```
Frontend   React 18 · Vite 5 · Tailwind 3 · Framer Motion 11 · Lucide
Backend    Node 20 · Express 4 · Mongoose 8
Database   MongoDB Atlas (M0 free tier)
Auth       JWT · bcrypt
Payments   Stripe Checkout SDK
AI         OpenAI-compatible (Mistral, Groq, OpenAI)
Deploy     Railway (Docker) · Vercel-compatible
```

---

## API Overview

```
/api/auth/*       Register, login, profile
/api/dishes/*     CRUD + category/search/price filters
/api/cart/*       Server-side cart
/api/orders/*     Order with Stripe/demo
/api/ai/*         Recommend, chat, SSE stream, meal plan
/api/admin/*      Stats, users, orders, coupons
/api/favorites/*  Wishlist toggle
/api/reviews/*    Rating + comments
/api/coupons/*    Validate & apply
```

Full reference: [docs/API.md](./docs/API.md)

---

## Project Structure

```
backend/            Express API + static frontend
  ├── controllers/  10 route handlers
  ├── models/       9 Mongoose schemas
  ├── routes/       10 API files
  ├── middlewares/   Auth, error, upload, OIDC
  └── public/       Built React SPA
frontend/           Vite + React SPA
  ├── src/pages/    13 pages
  ├── src/context/  3 providers (Auth, Cart, Theme)
  └── src/services/ Axios API layer
docs/               Architecture, API, database docs
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design, data flow, security |
| [HLD](./docs/HLD.md) | High-level design, components, integrations |
| [LLD](./docs/LLD.md) | Low-level design, controllers, routes, state |
| [API Reference](./docs/API.md) | All endpoints with examples |
| [Database](./docs/DATABASE.md) | Schema design, indexes, population |

---

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `MONGO_URI` | ✅ | — |
| `JWT_SECRET` | ✅ | — |
| `OPENAI_API_KEY` | ⚠️ | Falls back to local matching |
| `OPENAI_BASE_URL` | — | `https://router.bynara.id/v1` |
| `OPENAI_MODEL` | — | `mistral-medium-3-5` |
| `STRIPE_SECRET_KEY` | ⚠️ | Falls back to demo mode |
| `CLIENT_URL` | ⚠️ | Required for Stripe redirects |

---

## License

MIT
