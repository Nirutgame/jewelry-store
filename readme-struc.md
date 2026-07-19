# Lumière Jewelry Store — System Architecture

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript 5.4 |
| **Database** | PostgreSQL 16 + Prisma ORM 5.14 |
| **Authentication** | NextAuth.js 4 (Credentials Provider, JWT) + bcryptjs |
| **Styling** | Tailwind CSS 3.4 + Dark Mode (class strategy) |
| **Payment** | Stripe (Payment Intents + Webhooks) |
| **Email** | Resend |
| **Image Upload** | Cloudinary + local filesystem fallback |
| **Notifications** | LINE Notify API |
| **Charts** | Recharts |
| **Icons** | react-icons (Heroicons) |
| **Containerization** | Docker + Docker Compose |

---

## 2. Database Schema

```
User ──1:N──> CartItem ──N:1── Product
User ──1:N──> Order ──1:N── OrderItem ──N:1── Product
User ──1:N──> WishlistItem ──N:1── Product
User ──1:N──> Review ──N:1── Product
```

### Models

| Model | Key Fields | Relations |
|---|---|---|
| **User** | id (UUID), name, email (unique), password (hashed), role (customer\|admin) | → CartItem, Order, WishlistItem, Review |
| **Product** | id (UUID), name, nameEn, description, descriptionEn, price, images (JSON), category, material, stock, featured | → CartItem, OrderItem, WishlistItem, Review |
| **CartItem** | quantity, userId, productId | → User, Product (unique userId+productId) |
| **Order** | total, status, promoCode, paymentMethod, paymentStatus, stripePaymentIntentId, slipImage, shipping fields | → User, OrderItem |
| **OrderItem** | quantity, price, orderId, productId | → Order, Product |
| **Review** | rating, comment, isVisible, userId, productId | → User, Product (unique userId+productId) |
| **CategoryMeta** | slug (PK), nameTh, description, image, sortOrder | Standalone |
| **PromoCode** | code (unique), discountType, discountValue, minOrder, maxUsage, usedCount, expiresAt | Standalone |
| **PasswordResetToken** | email, token (unique), expiresAt, used | Standalone |

---

## 3. API Routes

### Public `/api/`

| Route | Methods | Purpose |
|---|---|---|
| `auth/[...nextauth]` | GET,POST | Login / Logout / Session |
| `register` | POST | Register new user |
| `forgot-password` | POST | Send password reset email |
| `reset-password` | POST | Reset password with token |
| `products` | GET | List products (filter: category, featured, search, page, limit) |
| `products/[id]` | GET,PUT,DELETE | Single product CRUD |
| `products/[id]/reviews` | GET,POST | Product reviews |
| `categories` | GET | All categories |
| `cart` | GET,POST,PUT,DELETE | Cart management |
| `orders` | GET,POST | User orders / Create order |
| `orders/[id]` | GET | Single order detail |
| `wishlist` | GET,POST,DELETE | Wishlist management |
| `wishlist/check` | GET | Check wishlist status |
| `promo/validate` | POST | Validate promo code |
| `contact` | POST | Submit contact form (rate-limited) |
| `upload` | POST | Upload product images |
| `upload/category` | POST | Upload category image |
| `upload/slip` | POST | Upload payment slip |
| `create-payment-intent` | POST | Stripe PaymentIntent (rate-limited) |
| `confirm-payment` | POST | Confirm Stripe payment |
| `webhook` | POST | Stripe webhook handler |

### Admin `/api/admin/`

| Route | Methods | Purpose |
|---|---|---|
| `products` | GET,POST | Manage products |
| `products/[id]` | PUT,DELETE | Edit/delete product |
| `orders` | GET | List all orders (filterable) |
| `orders/[id]` | GET,PUT | Order detail / update status |
| `customers` | GET | List all users |
| `customers/[id]` | GET | Customer detail |
| `categories` | GET,POST | Manage categories |
| `categories/[id]` | PUT,DELETE | Edit/delete category |
| `promocodes` | GET,POST | Manage promo codes |
| `promocodes/[id]` | PUT,DELETE | Edit/delete promo code |
| `reviews` | GET | List all reviews |
| `reviews/[id]` | PUT,DELETE | Toggle visibility / delete |
| `analytics` | GET | Dashboard statistics |

---

## 4. Pages (Routes)

### Public Pages

| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Home: hero carousel, category grid, featured products, CTA |
| `/products` | `products/page.tsx` | Product listing with filter, search, pagination |
| `/products/[id]` | `products/[id]/page.tsx` | Product detail + reviews + add to cart |
| `/cart` | `cart/page.tsx` | Shopping cart |
| `/checkout` | `checkout/page.tsx` | Checkout + shipping form + payment |
| `/orders` | `orders/page.tsx` | Order history |
| `/orders/[id]` | `orders/[id]/page.tsx` | Order detail |
| `/orders/[id]/upload-slip` | `orders/[id]/upload-slip/page.tsx` | Upload bank slip |
| `/wishlist` | `wishlist/page.tsx` | Wishlist |
| `/about` | `about/page.tsx` | About us |
| `/contact` | `contact/page.tsx` | Contact form |

### Auth Pages

| Route | Description |
|---|---|
| `/auth/login` | Login form |
| `/auth/register` | Registration form |
| `/auth/forgot-password` | Request password reset |
| `/auth/reset-password` | Reset password with token |

### Admin Pages (protected: role=admin)

| Route | Description |
|---|---|
| `/admin` | Dashboard: stat cards + charts (revenue, orders, top products, customer growth) |
| `/admin/products` | Product management (CRUD) |
| `/admin/products/create` | Create product |
| `/admin/products/[id]/edit` | Edit product |
| `/admin/orders` | Order management |
| `/admin/orders/[id]` | Order detail / update status |
| `/admin/customers` | Customer list |
| `/admin/customers/[id]` | Customer detail |
| `/admin/categories` | Category management |
| `/admin/promocodes` | Promo code management |
| `/admin/reviews` | Review moderation |

### System Files

| File | Purpose |
|---|---|
| `sitemap.ts` | Dynamic XML sitemap |
| `robots.ts` | Robots.txt |
| `favicon.ico` | Favicon |

---

## 5. Component Structure

### Layout Hierarchy

```
<html> (RootLayout)
  <body>
    <Providers>
      ├── SessionProvider (NextAuth)
      ├── ThemeProvider (dark/light)
      ├── LanguageProvider (th/en)
      └── ToastProvider (notifications)
    </Providers>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </body>
</html>
```

### Admin Layout

```
<AdminLayout>
  <aside>           Desktop sidebar nav
  <header>          Mobile header
  <main>{children}</main>
  <nav>             Mobile bottom tab bar
</AdminLayout>
```

### Key Components

| Component | Type | Description |
|---|---|---|
| Navbar | Client | Sticky: logo, categories (API), search, theme toggle, cart/wishlist/orders/user icons, language switcher, mobile menu |
| Footer | Client | 4-column: brand, categories, pages, contact |
| ProductCard | Client | Grid card: image, name (TH/EN), price, rating, stock badge, wishlist toggle, add-to-cart |
| ProductGrid | Client | Responsive grid + empty state |
| CartItem | Client | Line item: thumbnail, name, material, price, qty +/- , remove |
| StripePayment | Client | Stripe PaymentElement form |
| StarRating | Client | 5-star display (read-only / interactive) |
| ThemeToggle | Client | Dark mode toggle (sun/moon) |
| Toast | Client | Notification system (success/error/info/warning, 4s auto-dismiss) |

---

## 6. Authentication Flow

### Login Flow
```
Register → POST /api/register → hash(password) with bcryptjs → save User
Login    → NextAuth Credentials → verify email + bcrypt.compare → JWT (id, role)
Session  → JWT callback attaches id+role → session.user.id + session.user.role
Logout   → signOut() clears JWT
```

### Route Protection (middleware.ts)
- **Authenticated required**: `/cart`, `/checkout`, `/orders`, `/wishlist`
- **Admin only**: `/admin/*`
- Unauthenticated → redirect `/auth/login`
- Non-admin → redirect `/`

### Password Reset
1. POST `/api/forgot-password` → generate token → save to PasswordResetToken → send email via Resend
2. User clicks link → `/auth/reset-password?token=...`
3. POST `/api/reset-password` → validate token → hash new password → update user → mark token used

---

## 7. External Services

| Service | Purpose | Env Variables |
|---|---|---|
| **Stripe** | Card payment processing | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Cloudinary** | Image hosting & optimization | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Resend** | Transactional emails (order confirm, password reset, status update) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| **LINE Notify** | Admin notifications (new order, status change, slip upload) | `LINE_NOTIFY_TOKEN` |

---

## 8. Docker Deployment

### Production (`docker-compose.yml`)
```yaml
Services:
  db:  postgres:16       port 5433:5432   volume: pgdata
  app: Dockerfile build  port 3000:3000   depends_on: db (healthy)
```

### Development (`docker-compose.dev.yml`)
```yaml
Services:
  db:  postgres:16       port 5433:5432   volume: pgdata-dev
  app: node:20-bookworm  port 3000:3000   mount: .:/app
  command: install → prisma generate → db push → seed.js → seed-category.js → seed-products.js → next dev -H 0.0.0.0
```

### Dockerfile (Multi-stage)
- **Builder**: `node:20-bookworm-slim` → npm ci → prisma generate → next build
- **Runner**: `node:20-bookworm-slim` → copy artifacts → prisma generate + db push + seed → next start

---

## 9. Key Architectural Patterns

| Pattern | Implementation |
|---|---|
| **Server/Client Components** | Server components for data; `"use client"` for interactive pages |
| **Prisma Singleton** | Global cached client prevents hot-reload connection leaks |
| **Rate Limiting** | In-memory Map for contact form + payment intent creation |
| **Bilingual (TH/EN)** | JSON translation files via `LanguageContext` with `t()` function |
| **Dark Mode** | Tailwind `class` strategy + localStorage persistence |
| **Transaction** | Prisma `$transaction` for atomic order creation (order + items + stock + cart + promo) |
| **Stripe Dual Flow** | Webhook (async) + client confirm (immediate) for card payments |
| **Local File Upload** | Falls back to `public/uploads/` if Cloudinary not configured |

---

## 10. Seed Data

| File | Data | Users Created |
|---|---|---|
| `seed.js` | 2 users | `admin@lumiere.com` / `password123` (admin), `test@example.com` / `password123` (customer) |
| `seed-category.js` | 5 categories | rings, necklaces, earrings, bracelets, watches |
| `seed-products.js` | 15 products | 3 rings, 3 necklaces, 3 earrings, 3 bracelets, 3 watches |
