# 🛒 EcomNepal - Full Stack E-Commerce Platform

A modern, full-featured e-commerce platform built with **Next.js**, **MongoDB**, and **eSewa payment integration**. Designed for mini markets with dual-role functionality for owners and customers.

---

## ✨ Features

### 👤 Customer Features
- 🛍️ **Browse & Search** - Explore products with advanced search and category filtering
- 🛒 **Shopping Cart** - Add items to cart for bulk purchases
- 💳 **eSewa Payment** - Secure payment integration with eSewa
- 🎯 **Personalized Recommendations** - AI-powered suggestions based on browsing and purchase history
- 📦 **Order Tracking** - Track orders from purchase to delivery
- 🌙 **Dark/Light Mode** - Theme toggle for comfortable browsing

### 🏪 Owner/Admin Features
- 📝 **Product Management** - Create, edit, and delete products
- 📊 **Sales Dashboard** - View sales analytics and reports
- 📸 **Bulk Image Upload** - Efficiently manage product images
- 👥 **Customer Insights** - View customer activity and logs
- 📋 **Order Management** - Process and track customer orders
 hello world

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14, React, TailwindCSS |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB with Mongoose |
| **Authentication** | Custom Auth Context |
| **Payments** | eSewa Integration |
| **Styling** | TailwindCSS with Theme System |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- eSewa merchant account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecom.git
   cd ecom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your MongoDB URI, eSewa credentials, and other settings.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (costumer)/        # Customer-facing pages
│   ├── (theme)/           # Theme configuration
│   ├── owner/             # Admin/owner dashboard
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── cart/              # Cart components
│   ├── products/          # Product display components
│   ├── search/            # Search functionality
│   └── ui/                # Common UI elements
└── lib/                   # Utility functions & helpers
```

---

## 🎨 Theme System

The app supports **Light** and **Dark** modes with a centralized theme system. All colors are defined in `src/app/(theme)/theme.js` for easy customization:

- Stock status badges
- Category & subcategory badges
- Tags styling
- Price colors
- Info box backgrounds

---

## 📱 Screenshots

*Coming soon...*

---

## 📄 License

This project is part of the 6th Semester BITM curriculum.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Made with ❤️ using Next.js