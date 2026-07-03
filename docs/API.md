# Flavr — API Reference

> **Base URL:** `https://flavr.up.railway.app/api` | **Auth:** Bearer JWT Token

---

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{ "name": "User", "email": "user@example.com", "password": "secret123" }
→ 201 { _id, name, email, role, preferences, allergies, language, token }
```

### Login
```http
POST /auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "secret123" }
→ 200 { _id, name, email, role, preferences, allergies, language, token }
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
→ 200 { _id, name, email, role, preferences, allergies, language }
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "New Name", "preferences": ["veg","spicy"], "allergies": ["peanuts"], "language": "hindi" }
→ 200 { ...updated user }
```

## Dishes

### List Dishes
```http
GET /dishes?category=Lunch&search=biryani&minPrice=100&maxPrice=500&minRating=4
→ 200 [ { _id, name, description, price, imageUrl, category, restaurant, tags, rating, isAvailable } ]
```

### Get Dish
```http
GET /dishes/:id
→ 200 { dish with populated restaurant & menu }
```

### Create Dish (Admin)
```http
POST /dishes
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "name": "New Dish", "description": "Tasty", "price": 299, "category": "Lunch", "restaurant": "rest_id", "tags": ["veg"], "imageUrl": "https://..." }
→ 201 { created dish }
```

### Update Dish (Admin)
```http
PUT /dishes/:id
Authorization: Bearer <admin-token>
→ 200 { updated dish }
```

### Delete Dish (Admin)
```http
DELETE /dishes/:id
Authorization: Bearer <admin-token>
→ 200 { message: "Dish removed" }
```

## Cart

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
→ 200 { _id, items: [{ dish, quantity }] }
```

### Add to Cart
```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{ "dishId": "dish_id", "quantity": 2 }
→ 200 { updated cart }
```

### Update Item Quantity
```http
PUT /cart/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{ "quantity": 3 }
→ 200 { updated cart }
```

### Remove Item
```http
DELETE /cart/:itemId
Authorization: Bearer <token>
→ 200 { updated cart }
```

## Orders

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{ "shippingAddress": { "address": "...", "city": "...", "postalCode": "...", "country": "India" }, "couponCode": "FLAVR50", "discount": 200 }
→ 200 { url: "stripe-checkout-url" | demo: true, orderId }
```

### Get My Orders
```http
GET /orders/myorders
Authorization: Bearer <token>
→ 200 [ order, ... ]
```

### Get Order
```http
GET /orders/:id
Authorization: Bearer <token>
→ 200 { order with populated items }
```

### Update Status (Admin)
```http
PUT /orders/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "status": "Preparing" }
→ 200 { updated order }
```

## AI

### Recommend Dishes
```http
POST /ai/recommend
Authorization: Bearer <token>
Content-Type: application/json

{ "prompt": "healthy lunch under ₹300", "history": [{ "user": "...", "ai": "..." }], "language": "english" }
→ 200 { reply: "AI response text", fallback: false }
```

### General Chat
```http
POST /ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{ "message": "What drink goes with biryani?", "history": [], "language": "hindi" }
→ 200 { reply: "..." }
```

### Streaming Response (SSE)
```http
POST /ai/stream
Authorization: Bearer <token>
Content-Type: application/json

{ "prompt": "suggest a 3-day meal plan", "history": [], "language": "tamil" }
→ SSE stream: data: {"text": "..."}\n\ndata: {"done": true}\n\n
```

### Meal Planner
```http
POST /ai/meal-plan
Authorization: Bearer <token>
Content-Type: application/json

{ "preferences": ["veg","high-protein"], "days": 3 }
→ 200 { plan: "markdown meal plan text" }
```

## Favorites

### Get All Favorites
```http
GET /favorites
Authorization: Bearer <token>
→ 200 [ dish, ... ]
```

### Get Favorite IDs
```http
GET /favorites/ids
Authorization: Bearer <token>
→ 200 [ "dish_id_1", "dish_id_2" ]
```

### Toggle Favorite
```http
POST /favorites/:dishId
Authorization: Bearer <token>
→ 200 { favorited: true/false }
```

## Reviews

### Get Reviews for Dish
```http
GET /reviews/:dishId
→ 200 [ review, ... ]
```

### Add Review
```http
POST /reviews/:dishId
Authorization: Bearer <token>
Content-Type: application/json

{ "rating": 5, "comment": "Amazing!" }
→ 201 { review with auto-recalculated rating }
```

## Coupons

### Validate Coupon
```http
POST /coupons/validate
Authorization: Bearer <token>
Content-Type: application/json

{ "code": "FLAVR50", "amount": 599 }
→ 200 { valid: true, coupon: { code, discountType, discountValue, discount, description } }
```

### Apply Coupon (after order)
```http
PUT /coupons/apply
Authorization: Bearer <token>
Content-Type: application/json

{ "code": "FLAVR50" }
→ 200 { message: "Coupon applied", coupon }
```

## Admin

### Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer <admin-token>
→ 200 { totalUsers, totalOrders, totalDishes, totalRevenue, ordersByStatus, topDishes, monthlyRevenue }
```

### All Orders
```http
GET /admin/orders
Authorization: Bearer <admin-token>
→ 200 [ order, ... ]
```

### All Users
```http
GET /admin/users
Authorization: Bearer <admin-token>
→ 200 [ user, ... ]
```

### List Coupons
```http
GET /admin/coupons
Authorization: Bearer <admin-token>
→ 200 [ coupon, ... ]
```

### Create Coupon
```http
POST /admin/coupons
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "code": "NEW50", "discountType": "percentage", "discountValue": 50, "maxDiscount": 200, "minOrderAmount": 499, "usageLimit": 50 }
→ 201 { created coupon }
```

### Toggle Coupon
```http
PUT /admin/coupons/:id/toggle
Authorization: Bearer <admin-token>
→ 200 { toggled coupon }
```

### Delete Coupon
```http
DELETE /admin/coupons/:id
Authorization: Bearer <admin-token>
→ 200 { message: "Coupon deleted" }
```

## Restaurants

### List Restaurants
```http
GET /restaurants
→ 200 [ restaurant, ... ]
```

## Health

### Health Check
```http
GET /health
→ 200 { status: "🟢 Flavr API", version: "3.0.0" }
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 500 | Internal Server Error |
