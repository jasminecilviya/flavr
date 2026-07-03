<p align="center">
  <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop" alt="Flavr Banner" width="100%" />
</p>

<p align="center">
  <a href="https://flavr.up.railway.app">
    <img src="https://img.shields.io/badge/status-live-brightgreen?style=for-the-badge&logo=vercel" alt="Live">
  </a>
  <img src="https://img.shields.io/badge/stack-MERN%20%7C%20AI-0A0F1E?style=for-the-badge&logo=react" alt="Stack">
  <a href="https://flavr.up.railway.app">
    <img src="https://img.shields.io/badge/demo-flavr.up.railway.app-FF6B00?style=for-the-badge&logo=railway" alt="Demo">
  </a>
  <a href="./docs/API.md">
    <img src="https://img.shields.io/badge/API-docs-8B5CF6?style=for-the-badge&logo=readthedocs" alt="API Docs">
  </a>
</p>

---

# flavr

AI-powered food discovery platform with personalized meal recommendations, real-time order tracking, and full e-commerce flow.

---

## Quick Start

```bash
cp .env.example backend/.env
npm run install:all
npm run seed
npm run dev
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flavr.com | admin123 |
| User | priya@example.com | user123 |

---

## Features

| Area | Capabilities |
|------|-------------|
| **AI Chef Studio** | Multi-turn chat with Mistral, SSE streaming, EN/HI/TA, meal planner, voice input |
| **E-Commerce** | Server-side cart, Stripe Checkout, coupon engine, quantity controls |
| **Order Tracking** | Pending → Preparing → Out for Delivery → Delivered (timeline view) |
| **Admin Panel** | Analytics dashboard, dish CRUD w/ image picker, coupon management |
| **UX** | Dark/light mode, glassmorphism, Framer Motion, responsive, skeleton loaders |

---

## Stack

```
Frontend   React 18 · Vite 5 · Tailwind 3 · Framer Motion 11 · Lucide
Backend    Node 20 · Express 4 · Mongoose 8
Database   MongoDB Atlas
Auth       JWT · bcrypt
Payments   Stripe Checkout
AI         Mistral (OpenAI-compatible)
Deploy     Railway (Docker)
```

---

## API Endpoints

```
/api/auth/*         Register, login, profile
/api/dishes/*       CRUD + filters (category, price, search, rating)
/api/cart/*         Add, update qty, remove
/api/orders/*       Create, list, status update (admin)
/api/ai/*           Recommend, chat, SSE stream, meal plan
/api/admin/*        Stats, users, orders, coupons
/api/favorites/*    Toggle & list
/api/reviews/*      Rate & comment
/api/coupons/*      Validate & apply
```

Full reference → [docs/API.md](./docs/API.md)

---

## Structure

```
backend/            Express API + built frontend
  ├─ controllers/   10 handlers
  ├─ models/        9 schemas
  ├─ routes/        10 files
  └─ middlewares/   auth, error, upload
frontend/           Vite + React SPA
  ├─ pages/         13 pages
  ├─ context/       3 providers
  └─ services/      Axios layer
docs/               Architecture, HLD, LLD, API, DB design
```

---

## Documentation

| Doc | What it covers |
|-----|---------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design, deployment, data flow, security |
| [HLD](./docs/HLD.md) | High-level: components, integrations, decisions |
| [LLD](./docs/LLD.md) | Low-level: controllers, routes, state, error handling |
| [API Reference](./docs/API.md) | Every endpoint with request/response examples |
| [Database](./docs/DATABASE.md) | Schemas, indexes, population, ER diagram |

---

<p align="center">
  <sub>Built with ❤️ · MIT License</sub>
</p>
