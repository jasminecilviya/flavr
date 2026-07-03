# 🍽️ Flavor — AI-Powered Food Discovery Platform

> **Taste the Future** — A production-grade MERN stack application with AI-driven meal recommendations, multilingual support, and real-time order tracking.

<p align="center">
  <a href="https://flavr.up.railway.app" target="_blank">
    <img src="https://img.shields.io/badge/LIVE-https%3A%2F%2Fflavr.up.railway.app-orange?style=for-the-badge&logo=railway" alt="Live Demo">
  </a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Stack-MERN%2BAI-blue?style=for-the-badge" alt="Stack"></a>
  <a href="#-features"><img src="https://img.shields.io/badge/Features-20%2B-brightgreen?style=for-the-badge" alt="Features"></a>
</p>

---

## ✨ Features

### 🤖 **AI Chef Studio v3**
- **Multi-turn conversations** with personalized context (preferences, allergies, order history)
- **SSE streaming** — real-time token-by-token response rendering
- **Multilingual** — English, Hindi (हिन्दी), Tamil (தமிழ்)
- **Meal Planner** — AI generates 1/3/5/7 day meal plans
- **Budget detection** — auto-extracts budget from conversation
- **Voice input** — language-aware speech recognition
- **6 Mood selectors** — Healthy, Spicy, Budget, Cheat Day, High Protein, Vegan
- **Smart fallback** — local keyword matching when API is unavailable

### 🛒 **Full E-Commerce Flow**
- Server-side cart with quantity controls
- Coupon system (percentage/flat discounts, usage limits, min order)
- Stripe Checkout integration (demo fallback for development)
- Real-time order tracking: Pending → Preparing → Out for Delivery → Delivered
- Favorites/wishlist with heart toggle

### 👑 **Admin Panel v2**
- **Analytics dashboard** with animated counters and charts
- Order management with status updates
- Dish CRUD with premium image picker (8 Quick-select Unsplash photos)
- **Coupon management** — create, toggle, delete promotional codes
- User and restaurant management
- Top-rated dishes leaderboard

### 🎨 **Premium UI/UX**
- Dark/light mode with glassmorphism design
- Parallax hero with animated particles
- Framer Motion animations throughout
- Skeleton loaders and smooth transitions
- Fully responsive (mobile-first)
- Toast notifications
- Custom scrollbar

### 🛡️ **Security**
- JWT authentication with bcrypt password hashing
- Role-based access control (user/admin)
- Protected API routes
- OIDC Federation support (Vercel/Railway)

---

## 🏗️ Architecture

```
flavr/
├── backend/                    # Express + Mongoose API
│   ├── config/                 # Database, Cloudinary
│   ├── controllers/            # 10 route handlers
│   ├── middlewares/            # Auth, error, upload, OIDC
│   ├── models/                 # 9 Mongoose schemas
│   ├── routes/                 # 10 API route files
│   ├── utils/                  # JWT, AI client
│   ├── public/                 # Built frontend (served static)
│   ├── server.js               # Entry point
│   ├── app.js                  # Express app factory
│   └── Dockerfile              # Containerized deployment
├── frontend/                   # Vite + React + Tailwind
│   └── src/
│       ├── components/         # 7 reusable components
│       ├── context/            # Auth, Cart, Theme providers
│       ├── pages/              # 13 pages
│       ├── services/           # Axios API layer
│       └── utils/              # Constants
├── docs/                       # Design specs
├── .env.example                # Environment template
├── package.json                # Root orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (free tier works)

### 1. Clone & Install
```bash
git clone <your-repo-url> flavr
cd flavr
npm run install:all
```

### 2. Environment Variables
```bash
cp .env.example backend/.env
# Edit backend/.env with your values
```

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `OPENAI_API_KEY` | API key for AI recommendations | ⚠️ (falls back to local) |
| `OPENAI_BASE_URL` | OpenAI-compatible endpoint | Optional |
| `OPENAI_MODEL` | Model name (default: mistral-medium-3-5) | Optional |
| `STRIPE_SECRET_KEY` | Stripe secret key | ⚠️ (falls back to demo) |
| `CLIENT_URL` | Frontend URL for Stripe redirects | ⚠️ |

### 3. Seed Database
```bash
npm run seed
```
Creates: 2 users, 3 restaurants, 30 dishes, 3 coupons

### 4. Run Development
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### 5. Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | admin@flavr.com | admin123 |
| 👤 User | priya@example.com | user123 |

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/profile` | JWT | Get profile |
| PUT | `/api/auth/profile` | JWT | Update profile |

### Dishes & Menu
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dishes` | — | List dishes (filters: category, search, price, rating) |
| GET | `/api/dishes/:id` | — | Get dish details |
| POST | `/api/dishes` | Admin | Create dish |
| PUT | `/api/dishes/:id` | Admin | Update dish |
| DELETE | `/api/dishes/:id` | Admin | Delete dish |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | JWT | Get cart |
| POST | `/api/cart` | JWT | Add item |
| PUT | `/api/cart/:itemId` | JWT | Update quantity |
| DELETE | `/api/cart/:itemId` | JWT | Remove item |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | JWT | Create order |
| GET | `/api/orders/myorders` | JWT | My orders |
| GET | `/api/orders/:id` | JWT | Order details |
| PUT | `/api/orders/:id/status` | Admin | Update status |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/recommend` | JWT | Get recommendations |
| POST | `/api/ai/chat` | JWT | General food chat |
| POST | `/api/ai/stream` | JWT | SSE streaming |
| POST | `/api/ai/meal-plan` | JWT | Generate meal plan |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/orders` | Admin | All orders |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/coupons` | Admin | List coupons |
| POST | `/api/admin/coupons` | Admin | Create coupon |
| PUT | `/api/admin/coupons/:id/toggle` | Admin | Toggle coupon |
| DELETE | `/api/admin/coupons/:id` | Admin | Delete coupon |

### Extras
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/restaurants` | — | List restaurants |
| GET | `/api/favorites` | JWT | User's favorites |
| POST | `/api/favorites/:dishId` | JWT | Toggle favorite |
| GET | `/api/reviews/:dishId` | — | Get reviews |
| POST | `/api/reviews/:dishId` | JWT | Add review |
| POST | `/api/coupons/validate` | JWT | Validate coupon |

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion 11 |
| **Backend** | Node.js 20, Express 4, Mongoose 8 |
| **Database** | MongoDB Atlas (M0 free tier) |
| **Auth** | JWT + bcryptjs |
| **Payments** | Stripe Checkout SDK |
| **AI** | OpenAI-compatible API (Mistral, Groq, OpenAI) |
| **Icons** | Lucide React |
| **Deployment** | Railway (Docker), Vercel-compatible |
| **State** | React Context (Auth, Cart, Theme) |
| **HTTP** | Axios with interceptors |

## 🎨 Design System

| Token | Value |
|-------|-------|
| **Primary** | `#F97316` (Orange 500) |
| **Dark BG** | `#0A0F1E` |
| **Card BG** | `#1A1F2E` |
| **Font** | Inter (sans-serif) |
| **Radius** | 12px (cards), 16px (buttons), 24px (hero) |
| **Animation** | 300ms ease-out (Framer Motion) |

## 🤖 AI Integration

Flavr uses an OpenAI-compatible chat completions API. Configured via environment:

```env
OPENAI_API_KEY=sk-your_key
OPENAI_BASE_URL=https://router.bynara.id/v1
OPENAI_MODEL=mistral-medium-3-5
```

**Supported providers:** Mistral AI, Groq, OpenAI, Together AI, any OpenAI-compatible endpoint.

**Without an API key**, the app falls back to smart local keyword matching with preference-aware ranking.

## 🌐 Deployment

### Railway (current)
```bash
# Push to connected GitHub repo → auto-deploys
# Or use CLI:
railway login
railway up
```

### Vercel (serverless)
```bash
cd backend
vercel --prod
```

> **Note:** Frontend is built into `backend/public/` and served by Express as a monolith — no separate frontend hosting needed.

## 📁 Project Structure

```
backend/
├── server.js              # Entry, dotenv override, DB connect
├── app.js                 # Express factory, routes, static serving
├── Dockerfile             # Node 20-slim container
├── railway.json           # Railway deploy config
├── config/
│   ├── db.js              # Mongoose connection
│   └── cloudinary.js      # Image upload config
├── models/                # 9 Mongoose schemas
│   ├── User.js            # +preferences, allergies, language
│   ├── Restaurant.js      # Restaurant profile
│   ├── Menu.js            # Categories per restaurant
│   ├── Dish.js            # +tags, rating, availability
│   ├── Cart.js            # Server-side cart
│   ├── Order.js           # +discount, couponCode
│   ├── Favorite.js        # User favorites
│   ├── Review.js          # Ratings & comments
│   └── Coupon.js          # Promo codes
├── controllers/           # 10 route handlers
├── routes/                # 10 API route files
├── middlewares/           # Auth, error, upload, OIDC
└── utils/                 # JWT generator, AI client

frontend/
├── src/
│   ├── components/        # Navbar, Footer, DishCard, ChatMessage, etc.
│   ├── context/           # Auth, Cart, Theme
│   ├── pages/             # 13 pages (Home, Menu, Cart, Orders, etc.)
│   ├── services/api.js    # Axios instance + all API methods
│   └── utils/constants.js # Categories, sort options, status colors
├── vite.config.js         # Dev proxy to backend
└── tailwind.config.js     # Custom theme
```

## 📸 Screenshots

| Page | Description |
|------|-------------|
| **Home** | Parallax hero with rotating food imagery, animated particles, features grid, top-rated dishes, category cards, CTA |
| **Menu** | Search with clear, category pills, price range filter, animated dish cards with hover effects |
| **AI Chef Studio** | Multi-turn chat with streaming, mood selectors, language picker, budget slider, meal planner |
| **Admin** | Analytics dashboard with animated counters, order status breakdown, dish CRUD with image picker, coupon management |
| **Cart** | Quantity controls, image fallback, order summary, smooth animations |
| **Checkout** | Shipping form, coupon validation, real-time discount calculation |

## 🤝 Contributing

This is a personal/portfolio project. Feel free to fork and customize!

## 📄 License

MIT — Built with ❤️ and AI
