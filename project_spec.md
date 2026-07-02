# Project Specification: AI-Powered Food Delivery App (MERN Stack)

## 1. Project Overview & Vision
We are building a production-style, full-stack MERN food delivery application named **"FoodieBeast"**. This is not a basic CRUD app; it features an integrated AI assistant for personalized meal recommendations, a highly optimized UI/UX with dark mode, secure JWT authentication, Cloudinary image uploads, and a robust backend architecture. 

The app manages relationships between Restaurants, Menus, and FoodItems, supporting full e-commerce flows from cart to checkout (Stripe-integrated logic), order tracking, and an Admin dashboard.

## 2. Tech Stack
- **Frontend:** React.js (Vite), React Router v6, Tailwind CSS, Framer Motion (animations), React Context API (State), Axios (HTTP), React Toastify, Lucide React (Icons)
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB Atlas (Relational mapping via ObjectIds)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **Storage:** Cloudinary (via multer-storage-cloudinary)
- **Payments:** Stripe Checkout API integration
- **AI Integration:** OpenAI-compatible API (Node.js SDK)

---

## 3. Database Models & Relationships
*Use Mongoose. Implement proper referencing (`ref`) and population (`populate`).*

### 3.1 User Model
- `name` (String, required)
- `email` (String, required, unique, lowercase)
- `password` (String, required, min 6, select: false)
- `role` (String, enum: ['user', 'admin'], default: 'user')
- `preferences` (Array of Strings: e.g., ['vegan', 'spicy', 'high-protein']) - *Used for AI context*
- Timestamps (createdAt, updatedAt)
- **Pre-save hook:** Hash password using bcrypt if modified.
- **Methods:** `matchPassword(enteredPassword)` using `bcrypt.compare`.

### 3.2 Restaurant Model
- `name` (String, required) - e.g., "Foodsie Hub"
- `address` (String)
- `imageUrl` (String - Cloudinary URL)
- `menuId` (Ref to Menu)

### 3.3 Menu Model
- `restaurantId` (Ref to Restaurant, required)
- `categories` (Array of Strings: e.g., ['Breakfast', 'Lunch', 'Dinner'])

### 3.4 FoodItem Model
- `name` (String, required)
- `description` (String, required)
- `price` (Number, required)
- `imageUrl` (String - Cloudinary URL)
- `category` (String, required)
- `restaurant` (Ref to Restaurant)
- `menu` (Ref to Menu)
- `tags` (Array of Strings: e.g., ['veg', 'vegan', 'spicy', 'healthy', 'high-protein'])
- `rating` (Number, default: 0)
- `isAvailable` (Boolean, default: true)

### 3.5 Cart Model
- `user` (Ref to User, required)
- `items` (Array of objects: `{ foodItem: Ref to FoodItem, quantity: Number }`)
- **Methods:** Calculate total price virtual/populate.

### 3.6 Order Model
- `user` (Ref to User, required)
- `items` (Array of objects: `{ foodItem: Ref, quantity: Number, price: Number }`)
- `totalAmount` (Number, required)
- `shippingAddress` (Object: `{ address, city, postalCode, country }`)
- `paymentMethod` (String, default: 'Stripe')
- `paymentResult` (Object: `{ id, status }`)
- `status` (String, enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'], default: 'Pending')

---

## 4. Backend Architecture & API Endpoints
*Folder Structure:* `config/`, `controllers/`, `middlewares/`, `models/`, `routes/`, `utils/`

### 4.1 Authentication APIs (`/api/auth`)
- `POST /register` - Create user, hash password, return JWT.
- `POST /login` - Verify credentials, return JWT.
- `GET /profile` - (Protected) Get user profile.

### 4.2 Food & Category APIs (`/api/foods`)
- `GET /` - Get all foods (Support query params: `?category=`, `?search=`, `?minPrice=`, `?maxPrice=`, `?minRating=`).
- `GET /:id` - Get single food details.
- `POST /` - (Admin) Create food item.
- `PUT /:id` - (Admin) Update food item.
- `DELETE /:id` - (Admin) Delete food item.

### 4.3 Cart APIs (`/api/cart`)
- `GET /` - (Protected) Get user cart.
- `POST /` - (Protected) Add to cart / Update quantity.
- `DELETE /:item_id` - (Protected) Remove from cart.

### 4.4 Order APIs (`/api/orders`)
- `POST /` - (Protected) Create new order.
- `GET /myorders` - (Protected) Get user's order history.
- `GET /:id` - (Protected) Get order by ID.
- `PUT /:id/status` - (Admin) Update order status.

### 4.5 Admin APIs (`/api/admin`)
- `GET /users` - (Admin) Get all users.
- `GET /orders` - (Admin) Get all orders.

### 4.6 AI Assistant API (`/api/ai`)
- `POST /recommend` - (Protected) Accepts user prompt. 
  - **Logic:** Fetch a sample of available FoodItems from DB to use as context. Construct a system prompt instructing the AI to act as a nutritionist/chef. Return structured JSON or formatted text explaining *why* the recommendation was made, adhering to budget/health constraints.

---

## 5. Frontend Architecture & State Management
*Folder Structure:* `src/components/`, `src/pages/`, `src/context/`, `src/services/`, `src/utils/`, `src/hooks/`

### 5.1 Context API
- **AuthContext:** `user`, `token`, `login()`, `logout()`, `register()`, `isAdmin`.
- **CartContext:** `cartItems`, `addToCart()`, `removeFromCart()`, `updateQty()`, `cartTotal`.
- **ThemeContext:** `theme` ('light'/'dark'), `toggleTheme()`.

### 5.2 Pages & Routing
- `/` - **Home:** Hero section, Featured Categories, Top Rated Foods.
- `/menu` - **Menu:** Grid layout with sidebar filters (Category, Price, Rating).
- `/food/:id` - **Food Details:** High-quality image, description, quantity selector, Add to Cart.
- `/cart` - **Cart:** List items, total price, "Proceed to Checkout".
- `/checkout` - **Checkout:** Shipping form, Stripe payment integration simulation, Place Order.
- `/orders` - **Orders:** User's order history with status tracking.
- `/login` & `/register` - Auth forms with validation.
- `/profile` - **Profile:** User details, edit preferences (for AI).
- `/ai-assistant` - **AI Assistant:** Chat interface.
- `/admin` - **Admin Dashboard:** Protected route. Stats, Manage Foods, Manage Orders, Manage Users.
- `*` - **404 Page:** Fun, themed 404 page.

---

## 6. UI/UX Design System (The "Beast" Mode)
*This app must look modern, premium, and smooth. Use Tailwind CSS utility classes.*

- **Color Palette:**
  - Primary: `#FF6B00` (Appetizing Orange)
  - Dark Mode Background: `#0F172A` (Slate 900) / Cards: `#1E293B` (Slate 800)
  - Light Mode Background: `#F8FAFC` (Slate 50) / Cards: `#FFFFFF`
  - Text: Dynamic based on theme.
- **Typography:** Use 'Poppins' or 'Inter' from Google Fonts.
- **Components:**
  - **Navbar:** Sticky, glassmorphism effect (`backdrop-blur-md`), responsive hamburger menu, cart icon with badge, dark mode toggle.
  - **Food Cards:** Rounded corners (`rounded-xl`), subtle shadows, hover lift effect (`hover:-translate-y-1`), image zoom on hover.
  - **Buttons:** Gradient backgrounds (`bg-gradient-to-r from-orange-500 to-red-500`), smooth active states.
  - **Loaders:** Skeleton loaders for food cards (better UX than spinners), but include a global spinner for API calls.
  - **Notifications:** Use `react-toastify` for success/error messages positioned at bottom-right.
- **Animations:** Use `framer-motion` for page transitions (`AnimatePresence`) and staggered grid loading.

---

## 7. AI Assistant UI & Logic
- **Chat Interface:** A clean, modern chat window. User messages on right (orange bg), AI messages on left (slate bg).
- **Input Area:** Fixed at bottom with auto-resizing textarea and a send button.
- **Features:**
  - Quick prompt chips: "Suggest vegan dinner under $15", "High protein breakfast", "Something spicy".
  - Typing indicator while waiting for API response.
  - Renders AI response with proper formatting (bullet points, bold text).
  - Graceful error handling: If OpenAI API fails or prompt is invalid, show a friendly toast and fallback message.

---

## 8. Security & Middleware
- `authMiddleware.js`: Verifies JWT from `Authorization: Bearer <token>` header, attaches `req.user`.
- `adminMiddleware.js`: Checks `if (req.user.role === 'admin')` else returns 403.
- `errorMiddleware.js`: Centralized error handler. Never expose stack traces in production.
- `validation`: Use `express-validator` to check email formats, password lengths, and required fields.
- `dotenv`: All secrets (MONGO_URI, JWT_SECRET, CLOUDINARY_URL, OPENAI_API_KEY, STRIPE_SECRET_KEY) in `.env`.

---

## 9. Setup & Execution Instructions (For ZCODE Output)
ZCODE must output the project in a way that it runs immediately with these steps:
1. Root folder contains `/frontend` and `/backend`.
2. Provide a root `package.json` with scripts to run both concurrently (optional, or explain how to run separately).
3. Provide `README.md` with:
   - Architecture overview.
   - `.env.example` files for both frontend and backend.
   - MongoDB seed script (`backend/seeder.js`) to inject sample Restaurants, Menus, FoodItems, and an Admin user.
4. Code must be heavily commented with `// LOGIC: ...` explaining complex parts (e.g., AI context building, Stripe session creation).

