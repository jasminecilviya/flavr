# Flavr — Database Design

> **Database:** MongoDB Atlas M0 | **ODM:** Mongoose 8 | **Collections:** 9

---

## Collection: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | String | required, trim | Display name |
| `email` | String | required, unique, lowercase | Login identifier |
| `password` | String | required, min(6), select:false | bcrypt hashed |
| `role` | String | enum ['user','admin'], default:'user' | Authorization level |
| `preferences` | [String] | — | Dietary preferences (veg, spicy, etc.) |
| `allergies` | [String] | — | Food allergies |
| `language` | String | enum ['english','hindi','tamil'], default:'english' | AI response language |
| `timestamps` | — | true | createdAt, updatedAt |

**Indexes:** `email` (unique), `role`

---

## Collection: `restaurants`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | String | required | Restaurant name |
| `address` | String | required | Location |
| `imageUrl` | String | — | Cover photo |
| `menuId` | ObjectId | ref:'Menu' | Associated menu |

---

## Collection: `menus`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `restaurantId` | ObjectId | ref:'Restaurant' | Owner restaurant |
| `categories` | [String] | — | ['Breakfast','Lunch','Dinner','Beverages'] |

---

## Collection: `dishes`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | String | required, trim | Dish name |
| `description` | String | required | Description |
| `price` | Number | required, min:0 | Price in INR |
| `imageUrl` | String | — | Photo URL |
| `category` | String | required | Breakfast/Lunch/Dinner/Beverages |
| `restaurant` | ObjectId | ref:'Restaurant' | Serving restaurant |
| `menu` | ObjectId | ref:'Menu' | Parent menu |
| `tags` | [String] | — | ['veg','spicy','healthy',...] |
| `rating` | Number | default:0, min:0, max:5 | Average from reviews |
| `isAvailable` | Boolean | default:true | Visibility toggle |

**Indexes:** `restaurant`, `menu`, `category`, `price`, `rating`

---

## Collection: `carts`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user` | ObjectId | ref:'User', unique | Cart owner |
| `items` | [{dish, quantity}] | — | Cart line items |

### `items[]` subdocument

| Field | Type | Constraints |
|-------|------|-------------|
| `dish` | ObjectId | ref:'Dish' |
| `quantity` | Number | required |

---

## Collection: `orders`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user` | ObjectId | ref:'User', required | Order owner |
| `items` | [{dish, quantity, price}] | — | Order line items |
| `totalAmount` | Number | required | Final total after discount |
| `discount` | Number | default:0 | Applied discount amount |
| `couponCode` | String | — | Coupon used |
| `shippingAddress` | {address, city, postalCode, country} | required | Delivery address |
| `paymentMethod` | String | default:'Stripe' | Payment gateway |
| `paymentResult` | {id, status} | — | Stripe response |
| `status` | String | enum:[Pending,Preparing,Out for Delivery,Delivered], default:'Pending' | Fulfillment status |
| `timestamps` | — | true | createdAt, updatedAt |

---

## Collection: `favorites`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user` | ObjectId | ref:'User', required | User who favorited |
| `dish` | ObjectId | ref:'Dish', required | Favorited dish |

**Indexes:** `user + dish` (compound unique)

---

## Collection: `reviews`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user` | ObjectId | ref:'User', required | Reviewer |
| `dish` | ObjectId | ref:'Dish', required | Reviewed dish |
| `rating` | Number | required, min:1, max:5 | Star rating |
| `comment` | String | max:500 | Optional review text |
| `timestamps` | — | true | createdAt, updatedAt |

**Post-save middleware:** Recalculates `Dish.rating` as average of all reviews for that dish.

---

## Collection: `coupons`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | String | required, unique, uppercase | Promo code |
| `discountType` | String | enum ['percentage','flat'], default:'percentage' | Discount type |
| `discountValue` | Number | required, min:0 | Value (percentage or flat amount) |
| `minOrderAmount` | Number | default:0 | Minimum cart value |
| `maxDiscount` | Number | default:0 | Max discount for percentage type (0 = no limit) |
| `usageLimit` | Number | default:100 | Max times usable |
| `usedCount` | Number | default:0 | Times used |
| `isActive` | Boolean | default:true | Enable/disable |
| `expiresAt` | Date | — | Optional expiry |

---

## ER Diagram (Text)

```
User ────< Order        User ────< Cart
User ────< Favorite     User ────< Review
User ────< Review       Dish  ────< Review
User ────< Order.item   Dish  ────< Favorite
                         Dish  ────< Cart.item
Restaurant ────< Dish   Restaurant ────< Menu
Menu ────< Dish
```

## Mongoose Population Patterns

```javascript
// Get dishes with restaurant name
Dish.find().populate('restaurant', 'name imageUrl')

// Get cart with full dish data
Cart.findOne().populate('items.dish')

// Get orders with user and dish data
Order.find().populate('user', 'name email').populate('items.dish', 'name price imageUrl')

// Get favorites populated
Favorite.find({ user }).populate('dish')

// Get reviews with user info
Review.find({ dish }).populate('user', 'name')
```
