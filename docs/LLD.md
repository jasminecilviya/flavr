# Flavr — Low-Level Design

> **Scope:** Code structure, data models, controller logic, state management, routes.

---

## 1. Directory Structure

```
flavr/
├── backend/
│   ├── server.js                          # Entry: dotenv, DB connect, listen
│   ├── app.js                             # Express factory: middleware, routes, static
│   ├── Dockerfile                         # node:20-slim container
│   ├── railway.json                       # Deploy config (healthcheck, start cmd)
│   │
│   ├── config/
│   │   ├── db.js                          # Mongoose.connect() wrapper
│   │   └── cloudinary.js                  # Multer + Cloudinary storage engine
│   │
│   ├── models/
│   │   ├── User.js                        # name, email, password(bcrypt), role, preferences, allergies, language
│   │   ├── Restaurant.js                  # name, address, imageUrl, menuId
│   │   ├── Menu.js                        # restaurantId, categories[]
│   │   ├── Dish.js                        # name, desc, price, imageUrl, category, restaurant(ref), menu(ref), tags[], rating, isAvailable
│   │   ├── Cart.js                        # user(ref), items[{ dish(ref), quantity }]
│   │   ├── Order.js                       # user(ref), items[{ dish(ref), quantity, price }], totalAmount, discount, couponCode, shippingAddress, paymentResult, status
│   │   ├── Favorite.js                    # user(ref), dish(ref)
│   │   ├── Review.js                      # user(ref), dish(ref), rating, comment, auto-recalc dish.rating
│   │   └── Coupon.js                      # code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, usedCount, isActive, expiresAt
│   │
│   ├── controllers/                       # See §3 below
│   ├── routes/                            # See §4 below
│   ├── middlewares/                       # authMiddleware (JWT verify), errorMiddleware (asyncHandler + errorHandler), uploadMiddleware (multer)
│   └── utils/
│       ├── generateToken.js               # jwt.sign({ id, role })
│       └── aiClient.js                    # new OpenAI({ apiKey, baseURL })
│
├── frontend/
│   └── src/
│       ├── main.jsx                       # ReactDOM.createRoot
│       ├── App.jsx                        # Router + Providers
│       ├── index.css                      # Tailwind directives + custom classes
│       ├── context/
│       │   ├── AuthContext.jsx            # user, token, login, register, logout
│       │   ├── CartContext.jsx            # cartItems, cartTotal, add, update, remove
│       │   └── ThemeContext.jsx           # dark/light toggle, localStorage persist
│       ├── services/
│       │   └── api.js                     # Axios instance + all API endpoints
│       ├── utils/
│       │   └── constants.js               # CATEGORIES, SORT_OPTIONS, STATUS_COLORS
│       ├── components/                    # See §5 below
│       └── pages/                         # See §6 below
```

## 2. Data Models (Detailed)

### User
```
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, min:6, select:false, bcrypt hashed),
  role: enum ['user', 'admin'] (default: 'user'),
  preferences: [String],
  allergies: [String],
  language: enum ['english', 'hindi', 'tamil'] (default: 'english')
}
```
- **Pre-save hook:** auto-hashes password on modification
- **Instance method:** `matchPassword(entered)` compares bcrypt hash

### Dish
```
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  price: Number (required, min:0),
  imageUrl: String,
  category: String (required),
  restaurant: ObjectId (ref: Restaurant),
  menu: ObjectId (ref: Menu),
  tags: [String],
  rating: Number (default:0, min:0, max:5),
  isAvailable: Boolean (default: true)
}
```

### Order
```
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  items: [{
    dish: ObjectId (ref: Dish),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number (required),
  discount: Number (default:0),
  couponCode: String,
  shippingAddress: {
    address, city, postalCode, country
  },
  paymentResult: { id, status },
  status: enum ['Pending','Preparing','Out for Delivery','Delivered'] (default:'Pending')
}
```

### Coupon
```
{
  _id: ObjectId,
  code: String (required, unique, uppercase),
  discountType: enum ['percentage','flat'] (default:'percentage'),
  discountValue: Number (required, min:0),
  minOrderAmount: Number (default:0),
  maxDiscount: Number (default:0),
  usageLimit: Number (default:100),
  usedCount: Number (default:0),
  isActive: Boolean (default:true),
  expiresAt: Date
}
```

## 3. Controller Logic

### Auth Controller (`authController.js`)
| Method | Endpoint | Logic |
|--------|----------|-------|
| `register` | POST /api/auth/register | Validate unique email → User.create → generateToken → respond |
| `login` | POST /api/auth/login | Find user (+password) → matchPassword → generateToken → respond |
| `getProfile` | GET /api/auth/profile | FindById(req.user._id) → respond |
| `updateProfile` | PUT /api/auth/profile | FindByIdAndUpdate with name, preferences, allergies, language → respond |

### Dish Controller (`dishController.js`)
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| `getDishes` | GET /api/dishes | — | Build filter from query params → Dish.find(filter).populate('restaurant menu').sort({rating:-1}) |
| `getDish` | GET /api/dishes/:id | — | findById with populate |
| `createDish` | POST /api/dishes | Admin | Parse body/upload → Dish.create |
| `updateDish` | PUT /api/dishes/:id | Admin | findByIdAndUpdate |
| `deleteDish` | DELETE /api/dishes/:id | Admin | findByIdAndDelete |

### Cart Controller (`cartController.js`)
- **`getCart`:** FindOne({user}) or create empty → populate('items.dish')
- **`addToCart`:** Find or create cart → existing item? increment quantity : push new → save → repopulate
- **`updateCartItem`:** Find cart → items.id(itemId) → set quantity or pull if ≤0 → save
- **`removeFromCart`:** Find cart → filter out itemId → save

### Order Controller (`orderController.js`)
- **`createOrder`:** Get cart → build items array → apply coupon → create Order → Stripe session or demo fallback → clear cart
- **`getMyOrders`:** find({user}).sort('-createdAt').populate('items.dish')
- **`updateStatus`:** Admin only, findByIdAndUpdate status

### AI Controller (`aiController.js`)
- **`recommend`:** buildContext(user) → buildSystemPrompt → OpenAI call → fallback
- **`chat`:** Lightweight general food chat
- **`stream`:** SSE streaming with OpenA stream:true → res.write(data: ...)
- **`mealPlan`:** System prompt for structured meal plan generation

## 4. Route Configuration

```
/api/auth       → authRoutes      (register, login, profile, updateProfile)
/api/dishes     → dishRoutes      (CRUD + filters)
/api/cart       → cartRoutes      (get, add, update, remove)
/api/orders     → orderRoutes     (create, myOrders, getOne, updateStatus)
/api/admin      → adminRoutes     (users, orders, stats, coupons CRUD, reseed)
/api/ai         → aiRoutes        (recommend, chat, stream, mealPlan)
/api/restaurants → restaurantRoutes (list)
/api/favorites  → favoriteRoutes  (getAll, getIds, toggle)
/api/reviews    → reviewRoutes    (get, create)
/api/coupons    → couponRoutes    (validate, apply)
```

## 5. Frontend Components

| Component | Props | State | Description |
|-----------|-------|-------|-------------|
| `Navbar` | — | `open` (mobile menu) | Sticky glassmorphism nav with auth-aware links, cart badge, theme toggle |
| `Footer` | — | — | 4-column grid with dynamic links based on auth |
| `DishCard` | `dish, onAdd, index, favorited, onFavToggle` | `isFav, imgLoaded` | Premium card with image zoom, heart, skeleton, gradient badges |
| `ChatMessage` | `message, isUser, timestamp` | `showTime` | Markdown renderer with table support, follow-up chips, code blocks |
| `SkeletonCard` | — | — | Pulse animation placeholder for dish grid |
| `Loader` | `fullScreen` | — | Spinner overlay or inline |
| `ProtectedRoute` | `children` | — | Redirects to /login if not authenticated |
| `AdminRoute` | `children` | — | Redirects non-admin users to / |

## 6. Pages

| Page | Route | Key Features |
|------|-------|-------------|
| Home | `/` | Parallax hero, rotating images, particles, features grid, top-rated dishes, categories |
| Menu | `/menu` | Search, category pills, price filter, animated dish grid |
| DishDetails | `/food/:id` | Image, details, star rating, reviews, favorites, add-to-cart with qty |
| Cart | `/cart` | Items list with qty controls, image fallback, order summary, coupon |
| Checkout | `/checkout` | Shipping form, coupon validation, order summary |
| Orders | `/orders` | Expandable timeline tracking, 4-step status |
| Favorites | `/favorites` | Grid of favorited dishes with remove |
| AIAssistant | `/ai-assistant` | Multi-turn chat, SSE streaming, moods, language picker, meal planner, budget |
| Login | `/login` | Animated form, demo credentials toggle, password visibility |
| Register | `/register` | Validation feedback, password match indicator |
| Profile | `/profile` | Name, dietary prefs, allergies, language selection |
| Admin | `/admin` | Dashboard, orders, dishes CRUD, coupons, restaurants, users |
| NotFound | `*` | Branded 404 with navigation |

## 7. State Management

| Context | State | Persistence |
|---------|-------|-------------|
| AuthContext | `user`, `token`, `loading`, `isAdmin` | localStorage (flavrUser, flavrToken) |
| CartContext | `cartItems`, `cartTotal`, `loading` | Server-side (MongoDB) |
| ThemeContext | `theme` (dark/light) | localStorage (flavrTheme) |
| AI Chat | `messages`, `streaming`, `language`, `budget` | localStorage (flavr_ai_v3_history) |

## 8. Error Handling Pattern

```javascript
// asyncHandler wraps every controller
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

## 9. Key Middleware: Auth

```javascript
// JWT verification
const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

// Role check
const admin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  next();
};
```
