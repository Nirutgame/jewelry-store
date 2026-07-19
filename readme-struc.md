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
| **Email** | Nodemailer SMTP (Gmail/Outlook) + Resend fallback |
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
| **User** | id (UUID), name, email (unique), password (hashed), role (customer\|admin\|superadmin) | → CartItem, Order, WishlistItem, Review |
| **Product** | id (UUID), name, nameEn, description, descriptionEn, price, images (JSON), category, material, materialEn, stock, featured | → CartItem, OrderItem, WishlistItem, Review |
| **CartItem** | quantity, userId, productId | → User, Product (unique userId+productId) |
| **Order** | total, status, promoCode, paymentMethod, paymentStatus, stripePaymentIntentId, slipImage, shipping fields | → User, OrderItem |
| **OrderItem** | quantity, price, orderId, productId | → Order, Product |
| **Review** | rating, comment, isVisible, userId, productId | → User, Product (unique userId+productId) |
| **CategoryMeta** | slug (PK), nameTh, nameEn, description, descriptionEn, image, sortOrder | Standalone |
| **PromoCode** | code (unique), discountType, discountValue, minOrder, maxUsage, usedCount, expiresAt | Standalone |
| **OtpToken** | id, email, otp, expiresAt, used | Standalone (index on email) |
| **OtpLog** | id, email, action (send\|verify_failed\|reset_success), otp, metadata | Standalone (index on email + createdAt) |
| **PasswordResetToken** | email, token (unique), expiresAt, used | Standalone |

---

## 3. API Routes

### Public `/api/`

| Route | Methods | Purpose |
|---|---|---|
| `auth/[...nextauth]` | GET,POST | Login / Logout / Session |
| `auth/send-otp` | POST | Send 6-digit OTP to email (5-min expiry) |
| `auth/verify-otp` | POST | Verify OTP (used in forgot-password flow) |
| `auth/reset-password-by-otp` | POST | Verify OTP + hash password + update DB |
| `register` | POST | Register new user |
| `forgot-password` | POST | Send password reset email (or OTP) |
| `reset-password` | POST | Reset password with token |
| `products` | GET | List products (filter: category, featured, search, page, limit) |
| `products/[id]` | GET,PUT,DELETE | Single product CRUD |
| `products/[id]/reviews` | GET,POST | Product reviews |
| `categories` | GET | All categories (with nameEn, descriptionEn) |
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

### Admin `/api/admin/` (requireAdmin — admin + superadmin)

| Route | Methods | Purpose |
|---|---|---|
| `products` | GET,POST | Manage products |
| `products/[id]` | PUT,DELETE | Edit/delete product |
| `orders` | GET | List all orders (filterable) |
| `orders/[id]` | GET,PUT | Order detail / update status |
| `customers` | GET | List all users |
| `customers/[id]` | GET | Customer detail |
| `categories` | GET,POST | Manage categories (bilingual) |
| `categories/[id]` | PUT,DELETE | Edit/delete category |
| `promocodes` | GET,POST | Manage promo codes |
| `promocodes/[id]` | PUT,DELETE | Edit/delete promo code |
| `reviews` | GET | List all reviews |
| `reviews/[id]` | PUT,DELETE | Toggle visibility / delete |
| `analytics` | GET | Dashboard statistics |
| `users` | GET,POST | **List/create users (superadmin only)** |
| `users/[id]` | GET,PATCH,DELETE | **Manage user role + password (superadmin only)** |

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
| `/view` | `view/page.tsx` | Collection view (grouped by category) |

### Auth Pages

| Route | Description |
|---|---|
| `/auth/login` | Login form (password + OTP tab) |
| `/auth/register` | Registration form |
| `/auth/forgot-password` | 3-step: email → OTP → new password |
| `/auth/reset-password` | Reset password with token (old flow) |

### Admin Pages

| Route | Protected | Description |
|---|---|---|
| `/admin` | admin + superadmin | Dashboard: stat cards + charts |
| `/admin/products` | admin + superadmin | Product management (CRUD) |
| `/admin/products/create` | admin + superadmin | Create product |
| `/admin/products/[id]/edit` | admin + superadmin | Edit product |
| `/admin/orders` | admin + superadmin | Order management |
| `/admin/orders/[id]` | admin + superadmin | Order detail / update status |
| `/admin/customers` | admin + superadmin | Customer list |
| `/admin/customers/[id]` | admin + superadmin | Customer detail |
| `/admin/categories` | admin + superadmin | Category management |
| `/admin/promocodes` | admin + superadmin | Promo code management |
| `/admin/reviews` | admin + superadmin | Review moderation |
| `/admin/users` | **superadmin only** | **User management (CRUD)** |

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
  <aside>           Desktop sidebar nav (with avatar + role badge)
  <header>          Mobile header
  <main>{children}</main>
  <nav>             Mobile bottom tab bar (superadmin-only items filtered)
</AdminLayout>
```

### Key Components

| Component | Type | Description |
|---|---|---|
| Navbar | Client | Sticky: logo, categories (locale-aware), search, theme toggle, cart/wishlist/orders/user icons, language switcher, admin shield (admin+superadmin), mobile menu |
| Footer | Client | 4-column: brand, categories, pages, contact |
| ProductCard | Client | Grid card: image, name (TH/EN), price, rating, stock badge, wishlist toggle, add-to-cart |
| ProductGrid | Client | Responsive grid + empty state |
| CartItem | Client | Line item: thumbnail, name, material (locale-aware), price, qty +/- , remove |
| StripePayment | Client | Stripe PaymentElement form |
| StarRating | Client | 5-star display (read-only / interactive) |
| ThemeToggle | Client | Dark mode toggle (sun/moon) |
| Toast | Client | Notification system (success/error/info/warning, 4s auto-dismiss) |

---

## 6. Authentication Flow

### Login Flow
```
Password Login:
  Login → NextAuth Credentials → verify email + bcrypt.compare → JWT (id, role)
  Session → JWT callback attaches id+role → session.user.id + session.user.role
  Logout → signOut({ callbackUrl: "/auth/login" })

OTP Login (on forgot-password page):
  Enter email → POST /api/auth/send-otp → 6-digit OTP sent → enter OTP → step to new password
  POST /api/auth/reset-password-by-otp → verify OTP + hash password + update DB
  Redirect to /auth/login
```

### Route Protection (middleware.ts + guard.ts)
- **Authenticated required**: `/cart`, `/checkout`, `/orders`, `/wishlist`
- **Admin allowed** (`admin` + `superadmin`): `/admin/*`
- **Superadmin only** (`superadmin`): `/admin/users/*`, PATCH/DELETE on users
- Unauthenticated → redirect `/auth/login`
- Non-admin → redirect `/`

### 3 Roles

| Role | Admin Pages | Users Menu | Create Users | Edit/Delete Users |
|---|---|---|---|---|
| **superadmin** | ✅ | ✅ | ✅ | ✅ |
| **admin** | ✅ | ❌ | ❌ | ❌ |
| **customer** | ❌ | ❌ | ❌ | ❌ |

### Password / OTP Reset
1. Enter email on `/auth/forgot-password`
2. Receive 6-digit OTP (expires 5 min, resendable after 60s)
3. Enter OTP → proceed to new password form
4. Set new password (min 6 chars) → redirect to login
5. All actions logged in `OtpLog` table

---

## 7. External Services

| Service | Purpose | Env Variables |
|---|---|---|
| **Stripe** | Card payment processing | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Cloudinary** | Image hosting & optimization | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Resend** | Transactional email fallback | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| **Nodemailer SMTP** | Primary email sender (Gmail/Outlook) | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| **LINE Notify** | Admin notifications (new order, status change, slip upload) | `LINE_NOTIFY_TOKEN` |

### Mail Priority
1. If `SMTP_HOST` is configured → use Nodemailer (Gmail/Outlook SMTP)
2. If `SMTP_HOST` is empty → fallback to Resend

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

### WSL Configuration
- `.wslconfig`: memory=4GB, processors=2

---

## 9. Key Architectural Patterns

| Pattern | Implementation |
|---|---|
| **Server/Client Components** | Server components for data; `"use client"` for interactive pages |
| **Prisma Singleton** | Global cached client prevents hot-reload connection leaks |
| **Role Guard** | `src/lib/guard.ts` — `isAdmin()`, `isSuperAdmin()`, `requireAdmin()`, `requireSuperAdmin()` |
| **Rate Limiting** | In-memory Map for contact form + payment intent creation |
| **Bilingual (TH/EN)** | JSON translation files via `LanguageContext` with `t()` function; category + product fields have `nameEn`, `descriptionEn`, `materialEn` |
| **Dark Mode** | Tailwind `class` strategy + localStorage persistence |
| **Transaction** | Prisma `$transaction` for atomic order creation (order + items + stock + cart + promo) |
| **Stripe Dual Flow** | Webhook (async) + client confirm (immediate) for card payments |
| **Local File Upload** | Falls back to `public/uploads/` if Cloudinary not configured |
| **OTP Auth** | 6-digit numeric OTP, 5-min expiry, audit log via `OtpLog` |
| **Session 30 Days** | JWT strategy with `maxAge: 30 days`; cookie config |
| **Seed Guard** | Seed scripts skip if data exists (no overwrite on restart) |

---

## 10. Seed Data

| File | Data | Users Created |
|---|---|---|
| `seed.js` | 4 users | `nirut.rodngam1978@gmail.com` / `password1234` (superadmin), `admin@lumiere.com` / `password123` (admin), `test@example.com` / `password123` (customer), `user@user.com` / `password123` (customer) |
| `seed-category.js` | 5 categories | rings, necklaces, earrings, bracelets, watches (bilingual) |
| `seed-products.js` | 15 products | 3 rings, 3 necklaces, 3 earrings, 3 bracelets, 3 watches (bilingual) |

### Seed Safety
- `seed.js`: checks `user.count > 0` → skips if users exist
- `seed-products.js`: checks `product.count > 0` → skips if products exist
- `seed-category.js`: uses `upsert` (safe to run repeatedly)
