# Neno Jewelry Store — System Architecture

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14.2.35 (App Router) + TypeScript 5.8 |
| **Database** | PostgreSQL 16 + Prisma ORM 5.14 |
| **Authentication** | NextAuth.js 4 (Credentials Provider, JWT 30d) + bcryptjs (salt 12) |
| **Styling** | Tailwind CSS 3.4 + Dark Mode (class strategy) |
| **Payment** | Stripe (Payment Intents + Webhooks) |
| **Email** | Nodemailer SMTP (Gmail/Outlook) + Resend fallback |
| **Image Upload** | Local filesystem (`public/uploads/`) + magic byte validation |
| **Video Upload** | Local filesystem (`public/uploads/videos/`), MP4/WebM/OGG, max 50MB |
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
| **User** | id (UUID), name, email (unique), password (bcrypt 12 rounds), role (customer\|admin\|superadmin), **phone**, **address**, **district**, **province**, **zipcode** | → CartItem, Order, WishlistItem, Review |
| **Product** | id (UUID), name, nameEn, description, descriptionEn, price, images (JSON array), **video** (String?), category, material, materialEn, stock, featured | → CartItem, OrderItem, WishlistItem, Review |
| **CartItem** | quantity, userId, productId | → User, Product (unique userId+productId) |
| **Order** | total, status, promoCode, paymentMethod, paymentStatus, stripePaymentIntentId, slipImage, shipping fields | → User, OrderItem |
| **OrderItem** | quantity, price, orderId, productId | → Order, Product |
| **Review** | rating, comment, isVisible, userId, productId | → User, Product (unique userId+productId) |
| **CategoryMeta** | slug (PK), nameTh, nameEn, description, descriptionEn, image, sortOrder | Standalone |
| **PromoCode** | code (unique), discountType, discountValue, minOrder, maxUsage, usedCount, expiresAt, isActive | Standalone |
| **OtpToken** | id, email, otp (SHA-256 hashed), expiresAt, used | Standalone (index on email) |
| **OtpLog** | id, email, action (send\|verify_failed\|reset_success), otp (hashed), metadata | Standalone (index on email + createdAt) |
| **PasswordResetToken** | email, token (unique), expiresAt, used | Standalone |
| **SiteSetting** | id (UUID), storeNameTh, storeNameEn, taglineTh, taglineEn, phone, email, addressTh, addressEn, workingHoursTh, workingHoursEn, logoUrl, faviconUrl, seoTitleTh, seoTitleEn, seoDescTh, seoDescEn | Standalone (single row) |

---

## 3. API Routes

### Public `/api/`

| Route | Methods | Purpose |
|---|---|---|
| `auth/[...nextauth]` | GET,POST | Login / Logout / Session |
| `auth/send-otp` | POST | Send 6-digit OTP to email (10-min expiry, hashed in DB) |
| `auth/verify-otp` | POST | Verify OTP (SHA-256 hashed lookup, rate-limited) |
| `auth/reset-password-by-otp` | POST | Verify hashed OTP + hash password (bcrypt 12) + update DB |
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
| `settings` | GET,PUT | Site settings (store name, contact, SEO, logo) — GET public, PUT superadmin only |
| `upload` | POST | Upload product images (max 6, magic byte check, auth required) |
| `upload/video` | POST | Upload product video (1 file, MP4/WebM/OGG, max 50MB) |
| `upload/category` | POST | Upload category image (magic byte check, auth required) |
| `upload/slip` | POST | Upload payment slip (auth + order ownership required) |
| `upload/settings-logo` | POST | Upload store logo (SVG/PNG/WebP, superadmin only) |
| `create-payment-intent` | POST | Stripe PaymentIntent (rate-limited) |
| `confirm-payment` | POST | Confirm Stripe payment |
| `webhook` | POST | Stripe webhook handler |

### Admin `/api/admin/`

| Route | Methods | Purpose | Guard |
|---|---|---|---|
| `products` | GET,POST | Manage products | admin + superadmin |
| `products/[id]` | PUT,DELETE | Edit/delete product | admin + superadmin |
| `orders` | GET | List all orders (filterable) | admin + superadmin |
| `orders/[id]` | GET,PATCH | Order detail / update status | admin + superadmin |
| `customers` | GET | List all users | admin + superadmin |
| `customers/[id]` | GET | Customer detail | admin + superadmin |
| `customers/[id]` | PATCH | **Edit role/password** | **superadmin only** |
| `categories` | GET,POST | Manage categories (bilingual) | admin + superadmin |
| `categories/[id]` | PUT,DELETE | Edit/delete category | admin + superadmin |
| `promocodes` | GET,POST | Manage promo codes | admin + superadmin |
| `promocodes/[id]` | PATCH,DELETE | Edit/delete promo code | admin + superadmin |
| `reviews` | GET,PATCH | List/manage reviews | admin + superadmin |
| `reviews/[id]` | DELETE | Delete review | admin + superadmin |
| `analytics` | GET | Dashboard statistics | admin + superadmin |
| `users` | GET,POST | List/create users | **superadmin only** |
| `users/[id]` | GET,PATCH,DELETE | Manage user role + password | **superadmin only** |

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
| `/admin/customers` | admin + superadmin | Customer list (role badge shows real role name) |
| `/admin/customers/[id]` | admin + superadmin | Customer detail (role dropdown + password reset **hidden** for admin) |
| `/admin/categories` | admin + superadmin | Category management |
| `/admin/promocodes` | admin + superadmin | Promo code management |
| `/admin/reviews` | admin + superadmin | Review moderation |
| `/admin/users` | **superadmin only** | **User management (CRUD)** |
| `/admin/settings` | **superadmin only** | **Store settings (name, contact, SEO, logo)** |

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
    <Navbar />              {/* Hidden on /admin/* via usePathname() */}
    <main>{children}</main>
    <Footer />              {/* Hidden on /admin/* via usePathname() */}
  </body>
</html>
```

### Admin Layout

```
<AdminLayout>
  <aside>           Desktop sidebar nav (w-64, md:block, has user avatar + role badge)
  <header>          Mobile header (md:hidden, shows "Admin Panel" + "กลับหน้าร้าน")
  <main>{children}</main>
  <FAB>             Mobile: floating action button bottom-right (⚙️) → popup menu (md:hidden)
</AdminLayout>
```

### Key Components

| Component | Type | Description |
|---|---|---|
| Navbar | Client | Sticky: logo (SSR `data-logo-url` + `useSettings` fallback), categories (locale-aware, separate row on desktop), search, theme toggle, cart, wishlist/orders/admin (hidden on mobile, in hamburger), user avatar (logged-in mobile), language switcher, responsive mobile menu |
| Footer | Client | 4-column: brand, categories, pages, contact |
| ProductCard | Client | Grid card: image (first of 6), name (TH/EN), price, rating, stock badge, wishlist toggle, add-to-cart |
| ProductGrid | Client | Responsive grid + empty state |
| CartItem | Client | Line item: thumbnail, name, material (locale-aware), price, qty +/- , remove |
| StripePayment | Client | Stripe PaymentElement form |
| StarRating | Client | 5-star display (read-only / interactive) |
| ThemeToggle | Client | Dark mode toggle (sun/moon), responsive icon size |
| Toast | Client | Notification system (success/error/info/warning, 4s auto-dismiss) |

---

## 6. Authentication Flow

### Login Flow
```
Password Login:
  Login → NextAuth Credentials → verify email + bcrypt.compare (salt 12) → JWT (id, role)
  Session → JWT callback attaches id+role → session.user.id + session.user.role
  Logout → signOut({ redirect: false }) + window.location.href = origin + "/auth/login"

OTP Login (on forgot-password page):
  Enter email → POST /api/auth/send-otp → 6-digit OTP sent (SHA-256 hashed in DB)
  verify on client (frontend-only) → step to new password
  POST /api/auth/reset-password-by-otp → verify hashed OTP + hash password (bcrypt 12) + update DB
  Redirect to /auth/login
```

### Route Protection (middleware.ts + guard.ts)
- **Authenticated required**: `/cart`, `/checkout`, `/orders`, `/wishlist`
- **Admin allowed** (`admin` + `superadmin`): `/admin/*`
- **Superadmin only** (`superadmin`): `/admin/users/*`, PATCH/DELETE on users
- Unauthenticated → redirect `/auth/login`
- Non-admin → redirect `/`

### 3 Roles

| Role | Admin Pages | View Customers | Edit Customer Role/Password | Users Menu |
|---|---|---|---|---|
| **superadmin** | ✅ | ✅ | ✅ | ✅ |
| **admin** | ✅ | ✅ (read-only) | ❌ | ❌ |
| **customer** | ❌ | ❌ | ❌ | ❌ |

### Password / OTP Reset
1. Enter email on `/auth/forgot-password`
2. Receive 6-digit OTP (expires **10 min**, resendable after 60s, SHA-256 hashed in DB)
3. Enter OTP (frontend-only validation) → proceed to new password form
4. Set new password (min 6 chars, hashed bcrypt 12) → POST `/api/auth/reset-password-by-otp`
5. Server verifies hashed OTP → update password → redirect to login
6. All actions logged in `OtpLog` table

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
  command: npm install --legacy-peer-deps → prisma generate → db push → seed.js → seed-category.js → seed-products.js → next dev -H 0.0.0.0
Volumes: pgdata-dev, node_modules (named), next_build (named)
```

### Dockerfile (Multi-stage)
- **Builder**: `node:20-bookworm-slim` → npm ci → prisma generate → next build
- **Runner**: `node:20-bookworm-slim` → copy artifacts → next start (no db push in production)

### WSL Configuration
- `.wslconfig`: memory=4GB, swap=8GB, processors=12, localhostForwarding=true

---

## 9. Key Architectural Patterns

| Pattern | Implementation |
|---|---|
| **Server/Client Components** | Server components for data; `"use client"` for interactive pages |
| **Prisma Singleton** | Global cached client prevents hot-reload connection leaks |
| **Role Guard** | `src/lib/guard.ts` — `isAdmin()`, `isSuperAdmin()`, `requireAdmin()`, `requireSuperAdmin()` |
| **Rate Limiting** | In-memory Map with cleanup interval; applied to auth, contact, promo, payment endpoints |
| **Bilingual (TH/EN)** | JSON translation files via `LanguageContext` with `t()` function; category + product fields have `nameEn`, `descriptionEn`, `materialEn` |
| **Dark Mode** | Tailwind `class` strategy + localStorage persistence |
| **Transaction** | Prisma `$transaction` for atomic order creation (order + items + stock + cart + promo) |
| **Stripe Dual Flow** | Webhook (async) + client confirm (immediate) for card payments |
| **Local File Upload** | `public/uploads/products/` (images + videos), magic byte validation, crypto UUID filenames |
| **OTP Auth** | 6-digit numeric OTP, SHA-256 hashed in DB, 10-min expiry, rate-limited, audit log via `OtpLog` |
| **Session 30 Days** | JWT strategy with `maxAge: 30 days`; `SameSite=Strict` cookie config |
| **Seed Guard** | Seed scripts skip if data exists (no overwrite on restart) |
| **CSP Headers** | `style-src`, `font-src` (Google Fonts), `img-src` (Cloudinary, picsum, unsplash), `media-src` (video CDNs), `connect-src` (Stripe) |
| **SameSite Cookie** | `httpOnly`, `SameSite=Strict`, `Secure` in production (NextAuth session token) |
| **Mobile Viewport** | `min-h-dvh` (100dvh) + `scroll-buffer` (20vh) for address bar safe area |
| **Admin Tab FAB** | Mobile: floating action button (⚙️) + popup menu instead of sticky bottom nav |
| **CSS Hide on Admin** | `body:has([data-admin-root]) .navbar { display: none }` — no JS flash on SSR |
| **SSR Site Settings** | `layout.tsx` async fetch `SiteSetting` → `<body data-logo-url>` → Navbar แสดง logo ทันที refresh |
| **Company Profile** | `SiteSetting` model + admin settings page + SettingsContext + API (GET public, PUT superadmin) |

---

## 10. Security (3 Phases)

### Phase 0 — Emergency
- Revoked leaked Resend API keys, purged `.env` from git history (filter-branch + force push)

### Phase 1 — High Priority
| Fix | Details |
|---|---|
| Auth on upload endpoints | Magic byte validation (JPEG/PNG/WebP), crypto.randomUUID filenames |
| Server-side price verification | Orders + payment-intent query DB price, not client-supplied |
| Rate limiting | send-otp, verify-otp, forgot-password, register, promo/validate |
| Cart ownership | PUT/DELETE verify userId matches session |
| CSP headers | Google Fonts, picsum, fastly, Cloudinary, Stripe |
| Remove console.log | Password reset token no longer logged |

### Phase 2 — Medium Priority
| Fix | Details |
|---|---|
| OTP hashing | SHA-256 before DB storage (OtpToken + OtpLog) |
| Stop auto-account creation | OTP verify no longer creates accounts |
| Rate limiter cleanup | Periodic interval removes expired Map entries |
| requireSuperAdmin | User creation + role validation |
| Promo code mass assignment | Whitelist allowed fields only |
| Dependencies update | next 14.2.35, nodemailer 9.0.3, uuid 11.1.1 |
| Docker security | `prisma db push` removed from production CMD, named volumes, `POSTGRES_PASSWORD` via env |
| JSON.parse try/catch | `getImageUrl`, `getAllImages` safe fallback |
| Input validation | Email regex, password min 8, phone/zipcode, search length limit |
| SameSite=Strict | NextAuth cookie config |

### Phase 3 — Low Priority
| Fix | Details |
|---|---|
| Seed passwords | `Dev@123$Test#2026` (dev only) |
| NEXTAUTH_SECRET | Generated 256-bit random secret |

---

## 11. Seed Data

| File | Data | Details |
|---|---|---|
| `seed.js` | 4 users | `nirut.rodngam1978@gmail.com` / `Dev@123$Test#2026` (superadmin), `admin@lumiere.com` / `Dev@123$Test#2026` (admin), `test@example.com` / `Dev@123$Test#2026` (customer), `user@user.com` / `Dev@123$Test#2026` (customer) |
| `seed-category.js` | 5 categories | rings, necklaces, earrings, bracelets, watches (bilingual TH/EN) |
| `seed-products.js` | 15 products | 3 per category, **6 images** + **1 video** per product (90 images + 15 videos total) |

### Seed Safety
- `seed.js`: checks `user.count > 0` → skips if users exist
- `seed-products.js`: checks `product.count > 0` → skips if products exist
- `seed-category.js`: uses `upsert` (safe to run repeatedly)
