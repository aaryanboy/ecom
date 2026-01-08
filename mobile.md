# Mobile Application Documentation

> **Single Source of Truth** for React Native mobile app development with **shared MongoDB database and Supabase storage**.

---

## 1. File Overview

| Attribute | Details |
|-----------|---------|
| **File Name** | `mobile.md` |
| **Purpose** | E-commerce mobile app with full access to existing backend infrastructure |
| **Target Platforms** | Android & iOS (Cross-platform) |
| **Tech Stack** | React Native with Expo |
| **Database** | MongoDB (shared with web - same `DB_URL`) |
| **Storage** | Supabase Storage (shared bucket: `images`) |
| **Payment** | eSewa payment gateway |

### Shared Infrastructure
The mobile app has **direct access** to:
- Same MongoDB database as the web application
- Same Supabase storage bucket for product images
- Same user authentication system (session tokens)
- Same eSewa payment integration

---

## 2. Environment Variables

The mobile app requires these environment variables (same as web):

```env
# MongoDB Connection
DB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# eSewa Payment
ESEWA_SECRET_KEY=<your-esewa-secret>
ESEWA_PRODUCT_CODE=EPAYTEST

# API Base URL (for mobile)
API_BASE_URL=https://your-domain.com
```

---

## 3. Database Schemas (MongoDB)

### 3.1 User Schema

```javascript
const UserSchema = {
  // Authentication
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Encrypted
  isOwner: { type: Boolean, default: false },
  sessionToken: { type: String, default: null },

  // Profile
  firstName: String,
  lastName: String,
  phoneNumber: String,
  avatar: String,

  // Shipping Addresses
  addresses: [{
    fullName: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
  }],

  // Cart (embedded in user document)
  cart: [{
    productId: { type: ObjectId, ref: "Post", required: true },
    quantity: { type: Number, default: 1 }
  }],

  // Recommendation Interests (hierarchical)
  interests: [{
    category: { type: String, required: true },
    lastInteractionAt: { type: Date, default: Date.now },
    subcategories: [{
      name: { type: String, required: true },
      lastInteractionAt: { type: Date, default: Date.now },
      tags: [{
        name: { type: String, required: true },
        weight: { type: Number, default: 0 },
        lastInteractionAt: { type: Date, default: Date.now }
      }]
    }]
  }],

  timestamps: true  // createdAt, updatedAt
}
```

### 3.2 Product Schema (Post)

```javascript
const PostSchema = {
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, default: 0 },      // Stock quantity
  price: { type: Number, required: true },
  tags: { type: [String], default: [] },
  imagePath: { type: String, default: null }, // Supabase path
  imageUrl: { type: String, default: null },  // Supabase public URL
  category: { type: String, default: null },
  subCategory: { type: String, default: null },
  timestamps: true
}
```

### 3.3 Order Schema

```javascript
const OrderSchema = {
  userId: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'failed', 'pending'], 
    default: 'pending' 
  },
  deliveryStatus: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered'], 
    default: 'pending' 
  },
  items: [{
    productId: { type: ObjectId, ref: 'Post' },
    name: String,
    price: Number,
    quantity: Number
  }],
  timestamps: true
}
```

### 3.4 Payment Schema

```javascript
const PaymentSchema = {
  userId: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['success', 'failed', 'pending'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, default: 'eSewa' },
  items: [{
    productId: { type: ObjectId, ref: 'Post' },
    name: String,
    price: Number,
    quantity: Number
  }],
  createdAt: { type: Date, default: Date.now }
}
```

---

## 4. Product Categories

```javascript
const CATEGORIES = {
  "Electronics & Appliances": [
    "Mobile & Accessories",
    "Computers & Laptops",
    "TVs & Audio",
    "Cameras & Gadgets",
    "Home Appliances",
    "Kitchen Appliances"
  ],
  "Fashion": [
    "Clothing (Men, Women, Kids all together)",
    "Footwear",
    "Bags & Accessories",
    "Jewelry & Watches",
    "Seasonal Wear (Winter/Summer)"
  ],
  "Beauty & Personal Care": [
    "Skincare", "Haircare", "Makeup",
    "Personal Hygiene", "Fragrances"
  ],
  "Grocery & Food": [
    "Everyday Essentials (Rice, Oil, Flour)",
    "Snacks & Beverages",
    "Dairy & Breakfast",
    "Instant / Ready-to-eat",
    "Household Supplies"
  ],
  "Home & Living": [
    "Furniture", "Home Decor", "Kitchen & Dining",
    "Bedding & Furnishings", "Home Tools & Lighting"
  ],
  "Sports & Outdoor": [
    "Fitness & Exercise", "Sports Equipment",
    "Outdoor & Camping", "Sportswear & Accessories"
  ],
  "Automotive": [
    "Car Accessories", "Bike Accessories",
    "Oils & Maintenance Items", "Helmets & Safety Gear"
  ],
  "Baby, Kids & Toys": [
    "Baby Essentials", "Kids Clothing & Shoes",
    "Toys & Learning", "School Supplies"
  ],
  "Health & Wellness": [
    "Supplements", "Medical Devices",
    "First Aid", "Personal Wellness"
  ],
  "Stationery & Books": [
    "Books", "Office Supplies",
    "Art & Craft", "Notebooks & Paper"
  ],
  "Pets": [
    "Pet Food", "Pet Accessories", "Pet Care & Grooming"
  ]
};
```

---

## 5. Supabase Storage Integration

### 5.1 Configuration

```javascript
// Mobile Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const STORAGE_BUCKET = 'images';
```

### 5.2 Image Operations

```javascript
// Upload product image
async function uploadProductImage(file, fileName) {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 1e9);
  const uniqueFileName = `${timestamp}${rand}.${extension}`;
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(uniqueFileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });
  
  if (error) return null;
  
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(uniqueFileName);
  
  return { path: data.path, url: publicUrl };
}

// Get image URL (for displaying products)
function getImageUrl(imagePath) {
  return supabase.storage
    .from('images')
    .getPublicUrl(imagePath).data.publicUrl;
}

// Delete image
async function deleteProductImage(filePath) {
  const { error } = await supabase.storage
    .from('images')
    .remove([filePath]);
  return !error;
}
```

---

## 6. API Endpoints Reference

### 6.1 Authentication

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/auth/register` | POST | `{username, email, password}` | `{success, message}` |
| `/api/auth/login` | POST | `{email, password}` | `{user, sessionToken}` + Set-Cookie |
| `/api/auth/logout` | POST | - | `{success}` + Clear Cookie |
| `/api/auth/session` | GET | - | `{user}` or `{error: "Unauthorized"}` |

### 6.2 Products

| Endpoint | Method | Params/Body | Response |
|----------|--------|-------------|----------|
| `/api/products/list` | GET | `?page=1&limit=20` | `{products: [...]}` |
| `/api/products/[id]` | GET | - | `{product}` |
| `/api/products/search` | GET | `?q=query` | `{products: [...]}` |
| `/api/products/foryou` | GET | Requires auth | `{products: [...]}` |
| `/api/products/subcategory` | GET | `?name=subcategoryName` | `{products: [...]}` |
| `/api/products/tag` | GET | `?tag=tagName` | `{products: [...]}` |
| `/api/products/suggest` | GET | `?q=partial` | `{suggestions: [...]}` |

### 6.3 Cart

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/cart` | POST | `{userId, productId, quantity}` | `{success, cart}` |
| `/api/cart/get` | GET | `?userId=email` | `{items: [...]}` |
| `/api/cart/update` | POST | `{userId, itemId, quantity}` | `{cart}` |
| `/api/cart/remove` | POST | `{userId, itemId}` | `{success}` |

### 6.4 Payment

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/payment` | POST | `{userId}` or `{userId, productId, quantity}` | HTML form for eSewa |
| `/api/payment/verify` | GET | eSewa callback params | Redirect to success/failure |

### 6.5 User

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/user/profile` | GET | Requires auth | `{user}` |
| `/api/user/profile` | PUT | `{firstName, lastName, ...}` | `{user}` |
| `/api/user/orders` | GET | Requires auth | `{orders: [...]}` |

### 6.6 Owner (Admin)

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/owner/post` | POST | `{title, price, ...}` | `{post}` |
| `/api/owner/post` | PUT | `{id, updates}` | `{post}` |
| `/api/owner/post` | DELETE | `{id}` | `{success}` |
| `/api/owner/orders` | GET | Requires owner | `{orders: [...]}` |
| `/api/owner/payments` | GET | Requires owner | `{payments: [...]}` |

---

## 7. Authentication System

### 7.1 Session Token Flow

```
1. User logs in → Server validates credentials
2. Server generates UUID sessionToken
3. Server stores sessionToken in User.sessionToken
4. Server sends sessionToken via Set-Cookie header
5. Mobile stores sessionToken in SecureStore
6. All subsequent requests include sessionToken
7. Server validates by finding User with matching sessionToken
```

### 7.2 Mobile Implementation

```javascript
// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.sessionToken) {
    await SecureStore.setItemAsync('sessionToken', data.sessionToken);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

// Authenticated request
async function authFetch(url, options = {}) {
  const token = await SecureStore.getItemAsync('sessionToken');
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Cookie': `session=${token}`
    }
  });
}

// Logout
async function logout() {
  await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
  await SecureStore.deleteItemAsync('sessionToken');
  await AsyncStorage.removeItem('user');
}
```

### 7.3 Role-Based Access

| Role | `isOwner` | Access Level |
|------|-----------|--------------|
| Guest | - | Browse, search, view products |
| User | `false` | + Cart, orders, recommendations, profile |
| Owner | `true` | + Admin dashboard, product CRUD, all orders |

---

## 8. Recommendation System

### 8.1 How It Works

The recommendation system tracks user interests hierarchically:

```
Category → Subcategory → Tags (with weights)
```

### 8.2 Interest Tracking

```javascript
// When user views or buys a product
async function updateUserInterests(user, product, interactionType) {
  const weightIncrement = interactionType === 'buy' ? 10 : 1;
  const now = new Date();
  
  // Find or create category
  let category = user.interests.find(i => i.category === product.category);
  if (!category) {
    category = { category: product.category, lastInteractionAt: now, subcategories: [] };
    user.interests.push(category);
  }
  category.lastInteractionAt = now;
  
  // Find or create subcategory
  let subcategory = category.subcategories.find(s => s.name === product.subCategory);
  if (!subcategory) {
    subcategory = { name: product.subCategory, lastInteractionAt: now, tags: [] };
    category.subcategories.push(subcategory);
  }
  subcategory.lastInteractionAt = now;
  
  // Update tags with weights
  for (const tagName of product.tags) {
    let tag = subcategory.tags.find(t => t.name === tagName);
    if (tag) {
      tag.weight += weightIncrement;
      tag.lastInteractionAt = now;
    } else {
      subcategory.tags.push({ name: tagName, weight: weightIncrement, lastInteractionAt: now });
    }
  }
  
  // Prune to limits
  pruneInterests(user);
}
```

### 8.3 Pruning Limits

- Max 10 tags per subcategory
- Max 5 subcategories per category
- Sorted by weight/recency

---

## 9. eSewa Payment Integration

### 9.1 Signature Generation

```javascript
import crypto from 'crypto';

function generateEsewaSignature(secretKey, signatureString) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(signatureString);
  return hmac.digest('base64');
}

// Usage
const signatureString = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${productCode}`;
const signature = generateEsewaSignature(ESEWA_SECRET_KEY, signatureString);
```

### 9.2 Payment Flow

```
1. User initiates checkout
2. Server creates Payment record (status: pending)
3. Server generates eSewa form with signature
4. Mobile opens WebView with eSewa form
5. User completes payment on eSewa
6. eSewa redirects to success_url/failure_url
7. Server verifies payment, updates Payment & Order status
8. Mobile receives callback, shows result
```

### 9.3 Payment Request Structure

```javascript
const paymentData = {
  amount: totalAmount,
  tax_amount: 0,
  total_amount: totalAmount,
  transaction_uuid: transactionId,
  product_code: 'EPAYTEST',
  product_service_charge: 0,
  product_delivery_charge: 0,
  success_url: `${API_BASE_URL}/api/payment/verify`,
  failure_url: `${API_BASE_URL}/api/payment/verify`,
  signed_field_names: 'total_amount,transaction_uuid,product_code',
  signature: generatedSignature
};
```

---

## 10. Mobile Folder Structure

```
src/
├── app/                          # Expo Router screens
│   ├── (auth)/
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   └── _layout.jsx
│   ├── (tabs)/
│   │   ├── home.jsx
│   │   ├── search.jsx
│   │   ├── cart.jsx
│   │   ├── foryou.jsx
│   │   ├── profile.jsx
│   │   └── _layout.jsx
│   ├── product/[id].jsx
│   ├── category/[name].jsx
│   ├── checkout.jsx
│   └── _layout.jsx
│
├── components/
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   └── ProductImage.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   └── CartSummary.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Modal.jsx
│
├── services/
│   ├── api.js                    # API client
│   ├── auth.js                   # Auth functions
│   ├── supabase.js               # Supabase client
│   └── storage.js                # SecureStore/AsyncStorage
│
├── context/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── ThemeContext.jsx
│
├── models/                       # TypeScript interfaces / JS models
│   ├── User.js
│   ├── Product.js
│   └── Order.js
│
├── theme/
│   ├── colors.js
│   ├── typography.js
│   └── index.js
│
└── utils/
    ├── formatters.js
    ├── validators.js
    └── constants.js
```

---

## 11. Theme & Styling

### 11.1 Color Palette

```javascript
// Light Theme
export const lightTheme = {
  primary: '#D97706',        // Amber 600
  background: '#F9FAFB',     // Gray 50
  surface: '#FFFFFF',
  text: '#0F172A',           // Slate 900
  textSecondary: '#475569',  // Slate 600
  border: '#E2E8F0',         // Slate 200
  success: '#059669',        // Emerald 600
  danger: '#DC2626',         // Red 600
  warning: '#D97706',        // Amber 600
  price: '#D97706',
  stockHigh: '#059669',
  stockLow: '#F59E0B',
  stockOut: '#DC2626',
};

// Dark Theme
export const darkTheme = {
  primary: '#F59E0B',        // Amber 500
  background: '#020617',     // Slate 950
  surface: '#0F172A',        // Slate 900
  text: '#F1F5F9',           // Slate 100
  textSecondary: '#94A3B8',  // Slate 400
  border: '#1E293B',         // Slate 800
  success: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  price: '#F59E0B',
  stockHigh: '#059669',
  stockLow: '#F59E0B',
  stockOut: '#DC2626',
};
```

### 11.2 Typography

```javascript
export const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 17 },
  button: { fontSize: 16, fontWeight: '500' },
  price: { fontSize: 18, fontWeight: '700' },
};
```

---

## 12. Cart Operations

### 12.1 Cart Functions

```javascript
// Fetch user's cart
async function fetchCart(userId) {
  const res = await fetch(`${API_BASE_URL}/api/cart/get?userId=${userId}`);
  const data = await res.json();
  return data.items ?? [];
}

// Add to cart
async function addToCart(userId, productId, quantity = 1) {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, productId, quantity })
  });
  return res.json();
}

// Update quantity
async function updateCartItem(userId, itemId, quantity) {
  const res = await fetch(`${API_BASE_URL}/api/cart/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, quantity })
  });
  return res.json();
}

// Remove item
async function removeCartItem(userId, itemId) {
  const res = await fetch(`${API_BASE_URL}/api/cart/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId })
  });
  return res.json();
}

// Checkout (full cart)
async function checkout(userId) {
  const res = await fetch(`${API_BASE_URL}/api/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return res.text(); // Returns HTML form for eSewa
}

// Buy now (single product)
async function buyNow(userId, productId, quantity = 1) {
  const res = await fetch(`${API_BASE_URL}/api/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, productId, quantity })
  });
  return res.text();
}
```

---

## 13. Security Considerations

| Aspect | Implementation |
|--------|----------------|
| Token Storage | Expo SecureStore (encrypted) |
| API Requests | HTTPS only |
| Password | Encrypted before storage |
| Session Validation | Server-side token lookup |
| Input Sanitization | Trim, length limits |
| Payment Security | HMAC-SHA256 signatures |

---

## 14. Offline Support Strategy

| Feature | Online | Offline |
|---------|--------|---------|
| Browse Products | API fetch | Cached data |
| View Cart | API fetch | Local state |
| Add to Cart | Immediate sync | Queue for sync |
| Checkout | Process payment | Block with message |
| View Orders | API fetch | Cached data |

---

## 15. Build & Deployment

### 15.1 Environment Setup

```bash
# Development
npx expo start

# Android build
eas build --platform android --profile production

# iOS build  
eas build --platform ios --profile production
```

### 15.2 Environment Configs

| Environment | API URL | eSewa Mode |
|-------------|---------|------------|
| Development | http://localhost:3000 | test |
| Staging | https://staging.example.com | test |
| Production | https://api.example.com | production |

---

## 16. Key Implementation Notes

1. **User ID**: The system uses `email` as `userId` for cart/order operations
2. **Session Token**: UUID stored in `User.sessionToken`, sent via Cookie header
3. **Product Images**: Stored in Supabase bucket `images`, referenced by `imagePath` and `imageUrl`
4. **Cart Storage**: Embedded in User document, not separate collection
5. **Recommendations**: Tracked automatically on product view/purchase

---

> **Last Updated**: January 2026  
> **Version**: 2.0.0
