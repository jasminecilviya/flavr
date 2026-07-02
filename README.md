# 🍽️ Flavr — AI-Powered Food Delivery Platform

> **Taste the Future** — Full-stack MERN application with AI-driven meal recommendations.

![Flavr Banner](https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop)

## ✨ Features

- **🤖 AI Chef** — Personalized meal recommendations via OpenAI-compatible API (Mistral, Groq, etc.)
- **🌙 Dark Mode** — Premium glassmorphism UI with system-aware theming
- **🛒 Full Cart Flow** — Server-side cart with real-time sync
- **💳 Stripe Checkout** — Secure payment integration (live or test mode)
- **📦 Order Tracking** — Real-time status: Pending → Preparing → Out for Delivery → Delivered
- **👑 Admin Dashboard** — Manage orders, dishes, and users
- **🎨 30 Sample Dishes** — Pre-seeded across 3 Indian restaurants

## 🏗️ Architecture

```
flavr/
├── backend/          # Express + Mongoose API
│   ├── config/       # DB, Cloudinary
│   ├── controllers/  # Route handlers
│   ├── middlewares/   # Auth, error, upload
│   ├── models/       # User, Restaurant, Menu, Dish, Cart, Order
│   ├── routes/       # API endpoints
│   └── utils/        # JWT, AI client
├── frontend/         # Vite + React + Tailwind
│   └── src/
│       ├── components/  # Reusable UI
│       ├── context/     # Auth, Cart, Theme
│       ├── pages/       # 12 routes
│       └── services/    # Axios API layer
└── docs/             # Design specs & plans
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI

### 1. Clone & Install
```bash
git clone <your-repo-url> flavr
cd flavr
npm run install:all
```

### 2. Environment Variables
```bash
cp .env.example backend/.env
# Edit backend/.env with your values:
# - MONGO_URI, JWT_SECRET, OPENAI_API_KEY, STRIPE_SECRET_KEY
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### 5. Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flavr.com | admin123 |
| User | priya@example.com | user123 |

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Payments | Stripe Checkout SDK |
| AI | OpenAI-compatible API (Mistral/Groq/OpenAI) |
| Storage | Cloudinary (multer-storage-cloudinary) |
| Icons | Lucide React |

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/profile | JWT | Get profile |
| GET | /api/dishes | — | List dishes |
| GET | /api/dishes/:id | — | Get dish |
| GET | /api/cart | JWT | Get cart |
| POST | /api/cart | JWT | Add to cart |
| DELETE | /api/cart/:id | JWT | Remove item |
| POST | /api/orders | JWT | Create order |
| GET | /api/orders/myorders | JWT | My orders |
| POST | /api/ai/recommend | JWT | AI recommendation |
| GET | /api/admin/users | Admin | All users |
| GET | /api/admin/orders | Admin | All orders |

## 🎨 Design System

- **Primary**: `#FF6B00` (Signature Orange)
- **Dark BG**: `#0A0F1E` (Slate 900+)
- **Cards**: `#1A1F2E` / White
- **Font**: Inter
- **Effects**: Glassmorphism navbar, skeleton loaders, micro-interactions

## 📁 Project Structure

```
flavr/
├── backend/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express app
│   ├── config/db.js           # MongoDB connection
│   ├── models/                # 6 Mongoose models
│   ├── controllers/           # 6 controllers
│   ├── routes/                # 6 route files
│   ├── middlewares/           # auth, error, upload
│   ├── utils/                 # generateToken, aiClient
│   └── seeder.js              # Seed 30 dishes + users
├── frontend/
│   ├── src/
│   │   ├── components/        # 8 components
│   │   ├── pages/             # 12 pages
│   │   ├── context/           # 3 contexts
│   │   ├── services/api.js    # Axios + interceptors
│   │   └── utils/constants.js # Categories, statuses
│   ├── tailwind.config.js
│   └── vite.config.js         # Proxy /api -> backend
├── .env.example
├── package.json               # Root scripts
└── README.md
```

## 🤖 AI Integration

Flavr uses an OpenAI-compatible API for meal recommendations. Set `OPENAI_BASE_URL` to your provider:

- **Mistral**: `https://api.mistral.ai/v1`
- **Groq**: `https://api.groq.com/openai/v1`
- **OpenAI**: `https://api.openai.com/v1` (default)

Without an API key, the app falls back to smart local keyword matching.

## 📄 License

MIT
