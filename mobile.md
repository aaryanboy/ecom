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

###
---

## 16. Key Implementation Notes

1. **User ID**: The system uses `email` as `userId` for cart/order operations
2. **Session Token**: UUID stored in `User.sessionToken`, sent via Cookie header
3. **Product Images**: Stored in Supabase bucket `images`, referenced by `imagePath` and `imageUrl`
4. **Cart Storage**: Embedded in User document, not separate collection
5. **Recommendations**: Tracked automatically on product view/purchase

---

---

## 17. Mobile UI/UX Specifications

This section provides detailed UI specifications for each mobile screen to ensure visual consistency with the web application.

---

### 17.1 Design System Overview

#### Core Design Principles
| Principle | Implementation |
|-----------|----------------|
| **Brand Colors** | Amber primary (#D97706 light, #F59E0B dark), with emerald accents for success actions |
| **Typography** | Bold headers, clean body text, gradient text for brand elements |
| **Corners** | Rounded corners (`borderRadius: 12-24`) for cards, buttons, badges |
| **Shadows** | Subtle shadows in light mode, minimal in dark mode |
| **Spacing** | Consistent 4/8/12/16/24px spacing scale |

#### Component Library Structure

```javascript
// Mobile Component Mapping
const COMPONENTS = {
  // Navigation
  BottomTabBar: "Bottom navigation with 5 tabs",
  Header: "Sticky top header with search",
  Breadcrumb: "Navigation trail on detail pages",
  
  // Products
  ProductCard: "Grid/list product display",
  ProductGrid: "2-column responsive grid",
  ProductImage: "Aspect-ratio image container",
  
  // Actions
  Button: "Primary/Secondary/Ghost variants",
  QuantitySelector: "Stepper with +/- buttons",
  
  // Feedback
  LoadingSpinner: "Animated loading indicator",
  EmptyState: "Illustrated empty views",
  Badge: "Status/category badges"
};
```

---

### 17.2 Bottom Tab Navigation

The mobile app uses a **Bottom Tab Bar** instead of the web header navigation.

```
┌─────────────────────────────────────────┐
│                                         │
│           [Main Content Area]           │
│                                         │
├─────────────────────────────────────────┤
│  🏠    🔍    🛒    ❤️    👤            │
│ Home  Search Cart  ForYou Profile       │
└─────────────────────────────────────────┘
```

#### Tab Configuration

| Tab | Icon | Label | Route | Badge |
|-----|------|-------|-------|-------|
| Home | 🏠 `home-outline` | Home | `/home` | - |
| Search | 🔍 `search-outline` | Search | `/search` | - |
| Cart | 🛒 `cart-outline` | Cart | `/cart` | Cart item count |
| For You | ❤️ `heart-outline` | For You | `/foryou` | - |
| Profile | 👤 `person-outline` | Profile | `/profile` | - |

#### Tab Styling

```javascript
const TabBarStyle = {
  // Container
  container: {
    height: 64,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingBottom: 8, // Safe area
  },
  
  // Active Tab
  activeTab: {
    color: theme.primary, // Amber
    fontWeight: '600',
  },
  
  // Inactive Tab
  inactiveTab: {
    color: theme.mutedText,
  },
  
  // Cart Badge
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#DC2626', // Red
    color: 'white',
    fontSize: 10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  }
};
```

---

### 17.3 Top Header Bar

A sticky header appears on all screens with contextual content.

```
┌─────────────────────────────────────────┐
│  MyShop           [🔍 Search...]   [☀️] │
└─────────────────────────────────────────┘
```

#### Header Layout

```javascript
const HeaderLayout = {
  // Home Screen
  home: {
    left: "Logo (MyShop - gradient amber text)",
    center: "SearchBar (expandable)",
    right: "ThemeToggle button"
  },
  
  // Detail Screen
  detail: {
    left: "← Back button",
    center: "Page title",
    right: "Share/ThemeToggle"
  },
  
  // Auth Screens
  auth: {
    left: "Logo only",
    center: null,
    right: null
  }
};
```

#### Search Bar Component

```javascript
// SearchBar styling (matches web)
const SearchBarStyle = {
  container: {
    flex: 1,
    height: 40,
    backgroundColor: theme.imageBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
  },
  icon: {
    color: theme.mutedText,
    marginRight: 8,
  },
  // Autocomplete dropdown
  suggestions: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 300,
  }
};
```

---

### 17.4 Home Screen Layout

```
┌─────────────────────────────────────────┐
│  MyShop           [🔍........]     [☀️] │ ← Header
├─────────────────────────────────────────┤
│  ▼ Categories                           │ ← Collapsible Sidebar
│  ├─ Electronics & Appliances            │
│  ├─ Fashion                             │
│  └─ [See all →]                         │
├─────────────────────────────────────────┤
│  ✨ For You                             │ ← Section with horizontal scroll
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │ │     │ →     │
│  │ 📦  │ │ 📦  │ │ 📦  │ │ 📦  │       │
│  │Rs.X │ │Rs.X │ │Rs.X │ │Rs.X │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────────────┤
│  ─────────── Divider ───────────        │
├─────────────────────────────────────────┤
│  🛍️ All Products                        │ ← 2-column grid
│  ┌─────┐ ┌─────┐                        │
│  │     │ │     │                        │
│  │ 📦  │ │ 📦  │                        │
│  │Rs.X │ │Rs.X │                        │
│  └─────┘ └─────┘                        │
│  ┌─────┐ ┌─────┐                        │
│  │     │ │     │                        │
│  │ 📦  │ │ 📦  │                        │
│  └─────┘ └─────┘                        │
└─────────────────────────────────────────┘
```

#### Section Headers

```javascript
const SectionHeader = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  seeAll: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  }
};
```

#### Horizontal Product Scroll

```javascript
// For "For You" and "Trending" sections
const HorizontalScroll = {
  container: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  contentContainer: {
    gap: 12,
  },
  card: {
    width: 150, // Fixed width for horizontal scroll
  }
};
```

---

### 17.5 Product Card Component

Matches the web ProductCard design exactly.

```
┌─────────────────────┐
│  ┌───────────────┐  │
│  │               │  │ ← 4:5 aspect ratio
│  │   [Image]     │  │    with contain fit
│  │               │  │
│  └───────────────┘  │
│                     │
│  Product Title      │ ← 2 line clamp
│  that wraps...      │
│                     │
│  Rs. 1,999          │ ← Amber gradient text
└─────────────────────┘
```

#### Card Styling

```javascript
const ProductCardStyle = {
  container: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    // Press animation
    transform: [{ scale: pressed ? 0.98 : 1 }],
  },
  
  imageContainer: {
    aspectRatio: 4/5,
    backgroundColor: theme.imageBg,
    padding: 16,
  },
  
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  
  content: {
    padding: 12,
    gap: 8,
  },
  
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    numberOfLines: 2,
    lineHeight: 20,
  },
  
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.priceText, // Amber
  }
};
```

---

### 17.6 Product Detail Screen

```
┌─────────────────────────────────────────┐
│  ← Back              Product     [Share]│ ← Header
├─────────────────────────────────────────┤
│  Home / Electronics / Product Name      │ ← Breadcrumb
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │                                     ││
│  │          [Product Image]            ││ ← Square aspect
│  │                                     ││    with zoom gesture
│  │                                     ││
│  │                     [In Stock] ●    ││ ← Stock badge (top-right)
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  [Category]  [Subcategory]              │ ← Badges
│                                         │
│  Product Title Here                     │ ← Large bold text
│                                         │
│  Product description text that explains │ ← Muted text
│  the features and details...            │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Price                              ││ ← Info box
│  │  Rs. 12,999        15 units avail.  ││
│  └─────────────────────────────────────┘│
│                                         │
│  [#tag1] [#tag2] [#tag3]                │ ← Tag chips
│                                         │
├─────────────────────────────────────────┤
│  Quantity:  [ - ]  3  [ + ]             │ ← Quantity selector
│                                         │
│  ┌─────────────────┐ ┌─────────────────┐│
│  │  🛒 Add to Cart │ │  💰 Buy Now     ││ ← Action buttons
│  └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────┤
│  Similar Products                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │    │ │    │ │    │ │    │ →         │
│  └────┘ └────┘ └────┘ └────┘           │
└─────────────────────────────────────────┘
```

#### Badge Styles

```javascript
const BadgeStyles = {
  // Stock Status
  stockHigh: {
    backgroundColor: '#059669', // Emerald
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
  },
  stockLow: {
    backgroundColor: '#F59E0B', // Amber
  },
  stockOut: {
    backgroundColor: '#DC2626', // Red
  },
  
  // Category/Subcategory
  category: {
    backgroundColor: '#2563EB', // Blue
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '500',
  },
  subCategory: {
    backgroundColor: '#9333EA', // Purple
  },
  
  // Tags
  tag: {
    backgroundColor: theme.tag,
    color: theme.tagText,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '500',
  }
};
```

#### Action Buttons

```javascript
const ActionButtons = {
  // Add to Cart (Amber/Primary)
  addToCart: {
    flex: 1,
    backgroundColor: theme.button,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    transform: [{ scale: pressed ? 0.98 : 1 }],
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Buy Now (Emerald gradient)
  buyNow: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    // Gradient background
    background: 'linear-gradient(to right, #059669, #0D9488)',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
};
```

---

### 17.7 Cart Screen

```
┌─────────────────────────────────────────┐
│  ← Back                Your Cart        │
├─────────────────────────────────────────┤
│  Home / Your Cart                       │ ← Breadcrumb
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │  ┌────┐                             ││
│  │  │ 📦 │  Product Title              ││ ← Cart Item
│  │  └────┘  Rs. 999                    ││
│  │          Qty: [-] 2 [+]    [🗑️]     ││
│  ├─────────────────────────────────────┤│
│  │  ┌────┐                             ││
│  │  │ 📦 │  Another Product            ││
│  │  └────┘  Rs. 1,499                  ││
│  │          Qty: [-] 1 [+]    [🗑️]     ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │  Subtotal:              Rs. 3,497   ││ ← Summary
│  │  ─────────────────────────────────  ││
│  │  Total:                 Rs. 3,497   ││
│  │                                     ││
│  │  ┌─────────────────────────────────┐││
│  │  │       Proceed to Checkout       │││ ← Primary Button
│  │  └─────────────────────────────────┘││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Cart Item Component

```javascript
const CartItemStyle = {
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: theme.imageBg,
  },
  
  info: {
    flex: 1,
    gap: 4,
  },
  
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    numberOfLines: 2,
  },
  
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.priceText,
  },
  
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.surface,
  },
  
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  
  deleteButton: {
    padding: 8,
    color: theme.danger,
  }
};
```

#### Empty Cart State

```javascript
const EmptyCartStyle = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: theme.mutedText,
    marginBottom: 24,
  },
  button: {
    ...ActionButtons.addToCart,
    paddingHorizontal: 24,
  }
};
```

---

### 17.8 For You Screen

```
┌─────────────────────────────────────────┐
│  ← Back                 For You         │
├─────────────────────────────────────────┤
│  Home / For You                         │
├─────────────────────────────────────────┤
│                                         │
│  For You                                │ ← Large title
│  Based on your recent interests...      │ ← Subtitle
│                                         │
│  ┌─────┐ ┌─────┐                        │ ← 2-column grid
│  │     │ │     │                        │
│  │ 📦  │ │ 📦  │                        │
│  │Rs.X │ │Rs.X │                        │
│  └─────┘ └─────┘                        │
│  ┌─────┐ ┌─────┐                        │
│  │     │ │     │                        │
│  │ 📦  │ │ 📦  │                        │
│  └─────┘ └─────┘                        │
│                                         │
└─────────────────────────────────────────┘
```

#### Personalization Indicator

```javascript
const PersonalizationBanner = {
  personalized: {
    container: {
      backgroundColor: theme.success,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    text: "✨ Based on your recent interests and purchases.",
  },
  recent: {
    container: {
      backgroundColor: theme.warning,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    text: "🔥 Discover our latest trending items.",
  }
};
```

---

### 17.9 Profile Screen

```
┌─────────────────────────────────────────┐
│  ← Back                 Profile         │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────┐                     │
│         │  Avatar │                     │ ← Circle avatar
│         └─────────┘                     │
│         User Name                       │
│         user@email.com                  │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │  👤  Edit Profile                 → ││ ← Menu items
│  ├─────────────────────────────────────┤│
│  │  📍  Manage Addresses             → ││
│  ├─────────────────────────────────────┤│
│  │  📦  Order History                → ││
│  ├─────────────────────────────────────┤│
│  │  ☀️  Appearance               [🌙] ││ ← Theme toggle
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │           🚪 Logout                 ││ ← Danger button
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

### 17.10 Auth Screens (Login/Register)

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              MyShop                     │ ← Logo (gradient)
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │           Login                     ││ ← Card container
│  │                                     ││
│  │  Email                              ││
│  │  ┌─────────────────────────────────┐││
│  │  │                                 │││ ← Input field
│  │  └─────────────────────────────────┘││
│  │                                     ││
│  │  Password                           ││
│  │  ┌─────────────────────────────────┐││
│  │  │                                 │││
│  │  └─────────────────────────────────┘││
│  │                                     ││
│  │  [Error message if any]             ││ ← Red text
│  │                                     ││
│  │  ┌─────────────┐                    ││
│  │  │    Login    │  or register here  ││
│  │  └─────────────┘                    ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

#### Input Field Styling

```javascript
const InputStyle = {
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
  },
  inputFocused: {
    borderColor: theme.primary,
    borderWidth: 2,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  error: {
    borderColor: '#DC2626',
  }
};
```

---

### 17.11 Orders Screen

```
┌─────────────────────────────────────────┐
│  ← Back                 Orders          │
├─────────────────────────────────────────┤
│  Home / Orders                          │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │  Order #TXN123456                   ││
│  │  Jan 8, 2026                        ││
│  │                                     ││
│  │  ┌────┐ ┌────┐                      ││ ← Product thumbnails
│  │  │ 📦 │ │ 📦 │  +2 more             ││
│  │  └────┘ └────┘                      ││
│  │                                     ││
│  │  Total: Rs. 4,999                   ││
│  │                                     ││
│  │  [Payment: Paid ✓] [Delivery: 🚚]   ││ ← Status badges
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Order #TXN123455                   ││
│  │  ...                                ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Order Status Badges

```javascript
const OrderStatusBadges = {
  payment: {
    paid: { bg: '#059669', text: 'Paid ✓' },
    pending: { bg: '#F59E0B', text: 'Pending' },
    failed: { bg: '#DC2626', text: 'Failed' },
  },
  delivery: {
    delivered: { bg: '#059669', text: 'Delivered ✓' },
    shipped: { bg: '#2563EB', text: 'Shipped 🚚' },
    pending: { bg: '#F59E0B', text: 'Processing' },
  }
};
```

---

### 17.12 Loading & Error States

#### Loading Spinner

```javascript
const LoadingScreen = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: theme.border,
    borderTopColor: theme.primary, // Amber
    // Animate: rotate 360deg infinite 0.8s linear
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: theme.mutedText,
  }
};
```

#### Error/Empty States

```javascript
const EmptyState = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: theme.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  action: {
    ...ActionButtons.addToCart,
    paddingHorizontal: 24,
  }
};
```

---

### 17.13 Modals & Overlays

#### Confirm Modal (Buy Now)

```javascript
const ConfirmModal = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: theme.modal,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: theme.mutedText,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    ...ActionButtons.buttonSecondary,
  },
  confirmButton: {
    flex: 1,
    ...ActionButtons.buyNow,
  }
};
```

---

### 17.14 Gesture & Animation Guidelines

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Card Press | Scale down to 0.98 | 100ms |
| Card Release | Scale back to 1.0 | 100ms |
| Button Press | Scale down to 0.95 | 50ms |
| Page Transition | Slide from right | 300ms |
| Modal Open | Fade + scale from 0.9 | 200ms |
| Pull to Refresh | Native spring | System |
| Scroll | Native momentum | System |
| Tab Switch | Crossfade | 150ms |

#### Press Feedback Example

```javascript
// Using Pressable from React Native
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.card,
    { transform: [{ scale: pressed ? 0.98 : 1 }] }
  ]}
>
  {children}
</Pressable>
```

---

> **Last Updated**: January 2026  
> **Version**: 2.0.0
