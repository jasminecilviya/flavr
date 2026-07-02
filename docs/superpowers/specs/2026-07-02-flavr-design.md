# Flavr — Full-Stack AI Food Delivery Platform

## Overview
Flavr is a production-grade, MNC-level food discovery & delivery platform with AI-powered meal recommendations. Built with MERN stack, real Stripe Checkout, OpenAI-compatible AI, and a premium dark-mode-first UI.

## Brand Identity
- **Name:** Flavr (short, punchy, tech-forward, globally brandable)
- **Tagline:** *Taste the Future*
- **Primary Color:** `#FF6B00` (Signature Orange)
- **Dark Surface:** `#0A0F1E` / `#1A1F2E`
- **Light Surface:** `#F8FAFC` / `#FFFFFF`
- **Typography:** Inter (headings & body)
- **Design Language:** Glassmorphism, gradient accents, micro-interactions, skeleton-first loading

## Architecture

### Repository Structure
```
flavr/
├── backend/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Menu.js
│   │   ├── Dish.js          # renamed from FoodItem
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dishController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── adminController.js
│   │   └── aiController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dishRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── aiRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── aiClient.js
│   └── seeder.js
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── DishCard.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── DishDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── NotFound.jsx
│   │   └── utils/
│   │       └── constants.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── .env.example
├── package.json
└── README.md
```

### API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login user |
| GET | /api/auth/profile | JWT | Get profile |
| GET | /api/dishes | Public | List dishes (filters) |
| GET | /api/dishes/:id | Public | Single dish |
| POST | /api/dishes | Admin | Create dish |
| PUT | /api/dishes/:id | Admin | Update dish |
| DELETE | /api/dishes/:id | Admin | Delete dish |
| GET | /api/cart | JWT | Get cart |
| POST | /api/cart | JWT | Add/update cart item |
| DELETE | /api/cart/:itemId | JWT | Remove cart item |
| POST | /api/orders | JWT | Create order |
| GET | /api/orders/myorders | JWT | User order history |
| GET | /api/orders/:id | JWT | Order details |
| PUT | /api/orders/:id/status | Admin | Update status |
| POST | /api/ai/recommend | JWT | AI recommendation |
| GET | /api/admin/users | Admin | All users |
| GET | /api/admin/orders | Admin | All orders |

### Models (Mongoose)
- **User** — name, email, password(hashed, select:false), role, preferences[], timestamps
- **Restaurant** — name, address, imageUrl, menuId(ref Menu)
- **Menu** — restaurantId(ref Restaurant), categories[]
- **Dish** — name, description, price, imageUrl, category, restaurant(ref), menu(ref), tags[], rating, isAvailable
- **Cart** — user(ref User, unique), items[{dish(ref Dish), quantity}]
- **Order** — user(ref), items[{dishRef, qty, price}], totalAmount, shippingAddress{addr,city,postal,country}, paymentMethod, paymentResult{id,status}, status[Pending→Preparing→Out for Delivery→Delivered]

## UI/UX Design System
- **Layout:** Max-w-7xl centered, consistent section padding
- **Navbar:** Sticky glassmorphism, logo left, nav center, cart icon+badge + theme toggle + auth right
- **Dish Cards:** Aspect-video image, overlay gradient, category badge, price, rating stars, add-to-cart
- **Buttons:** Orange→Red gradient, rounded-lg, hover:shadow-lg, active:scale-95
- **Forms:** Dark inputs with border-glowing focus, floating labels pattern
- **Animations:** Framer motion — AnimatePresence route transitions, staggered cards, fade-in sections
- **Loaders:** Skeleton pulse cards matching dish card layout, global overlay spinner for API
- **Toasts:** `react-toastify` styled to match brand, positioned bottom-right
- **Chat:** AI assistant — bubble layout, user=orange right, AI=slate left, typing dots, quick chips

## Commit Strategy (8 Milestones)
1. Backend skeleton + all models
2. Backend middlewares + utils
3. Backend all controllers + routes
4. Backend server.js, app.js, seeder.js + root setup
5. Frontend scaffold (Vite, Tailwind, context, services)
6. Frontend components (Navbar, Footer, DishCard, Skeleton, Loader, etc.)
7. Frontend pages (all 12 pages)
8. Polish, README, final commit
