Neno Jewelry Store — System Architecture

This page provides a comprehensive overview of the Neno Jewelry Store system architecture, including its technology stack, database schema, API routes, page structure, authentication flow, external services, security measures, and deployment details.

1. Tech Stack

The system is built using modern technologies:

Framework: Next.js 14.2.35 with App Router and TypeScript 5.8

Database: PostgreSQL 16 with Prisma ORM 5.14. User model includes optional address fields (phone, address, district, province, zipcode).

Authentication: NextAuth.js 4 with Credentials Provider and JWT (30-day session, SameSite=Strict), using bcryptjs (salt 12) for password hashing

Styling: Tailwind CSS 3.4 with dark mode support (class strategy), mobile viewport using dvh (dynamic viewport height) with 20vh scroll buffer

Payment: Stripe integration with Payment Intents and Webhooks

Email: Nodemailer SMTP (Gmail/Outlook) with Resend fallback

Image Upload: Local filesystem (public/uploads/) with magic byte validation, crypto.randomUUID filenames, max 6 images per product

Video Upload: Local filesystem (public/uploads/videos/), MP4/WebM/OGG, max 50MB, 1 video per product

Notifications: LINE Notify API

Charts: Recharts

Icons: react-icons (Heroicons)

Containerization: Docker and Docker Compose with named volumes (pgdata-dev, node_modules, next_build)

2. Database Schema

The database schema includes 12 models: User, Product, CartItem, Order, OrderItem, WishlistItem, Review, CategoryMeta, PromoCode, OtpToken, OtpLog, and PasswordResetToken. The User model stores optional address fields (phone, address, district, province, zipcode). The Product model stores images as a JSON string array (up to 6 URLs) and optionally a single video URL. OTP values are stored as SHA-256 hashes with 10-minute expiry.

3. API Routes

The system exposes various API routes for public and admin use, including authentication (password + OTP with rate limiting), product management (with server-side price verification), cart and order handling (with ownership checks), wishlist, promo code validation, contact form submission, image/video uploads (with magic byte validation and auth), and payment processing. Customer API returns address fields and review product nameEn.

4. Pages (Routes)

The application includes public pages such as home, product listings (with responsive image gallery and 6-image thumbnail scroll), cart, checkout, orders, wishlist, about, and contact, as well as authentication pages (login, register, forgot-password with 3-step OTP flow) and admin pages for managing products, orders, customers, categories, promo codes, reviews, and users. Admin pages hide the public Navbar and Footer via CSS (data-admin-root attribute selector, no JS flash).

5. Component Structure

Key components include Navbar (responsive, language toggle, user avatar on mobile, categories in separate row, classes: .navbar for CSS hiding), Footer (4-column: brand, categories, pages, contact, classes: .footer for CSS hiding), ProductCard (first of 6 images), ProductGrid, CartItem, StripePayment, StarRating, ThemeToggle (responsive sizing), and Toast notifications. Admin layout features floating action button (FAB) with popup menu on mobile and desktop sidebar with user badge.

6. Authentication Flow

Authentication supports password login (bcrypt compare) and OTP login flows (SHA-256 hashed OTP, 10-min expiry, rate-limited). Three roles: customer, admin, superadmin — with route protection via middleware.ts and guard.ts. Logout uses dynamic window.location.origin to redirect correctly regardless of domain.

7. External Services

The system integrates with Stripe for payments, Resend and Nodemailer for email, and LINE Notify for notifications. Image and video files are stored locally on the filesystem (no external media CDN in development).

8. Docker Deployment

Deployment is managed via Docker and Docker Compose with separate configurations for production (Dockerfile multi-stage build) and development (docker-compose.dev.yml with npm install, prisma generate/db push, seed, and hot-reload). Named volumes persist node_modules, database data, and next build cache across restarts.

9. Security & Key Architectural Patterns

Patterns include server/client component separation, Prisma singleton for database connections, role-based guards (requireAdmin, requireSuperAdmin), rate limiting with auto-cleanup, bilingual TH/EN support, dark mode, transactional order creation, Stripe dual payment flow, local file upload with magic byte validation, OTP SHA-256 hashing, session management (30-day JWT, SameSite=Strict), Content Security Policy headers (img-src, media-src, style-src for Google Fonts, connect-src for Stripe), mobile viewport safety (min-h-dvh + 20vh scroll buffer), admin FAB popup menu, CSS-based Navbar/Footer hiding on admin pages (no hydration flash), and seed data safety checks.

10. Security Fixes (3 Phases)

Phase 0 — Emergency: Revoked leaked Resend API keys, purged .env from git history (filter-branch + force push).

Phase 1 — High Priority: Auth + magic byte validation on upload endpoints, server-side price verification, rate limiting on auth/promo endpoints, cart ownership verification, CSP headers, removed console.log of reset tokens, restricted image domains.

Phase 2 — Medium Priority: OTP SHA-256 hashing, stopped auto-account creation, rate limiter cleanup, requireSuperAdmin for user management, promo code mass assignment fix, dependency updates (next 14.2.35, nodemailer 9.0.3, uuid 11.1.1), Docker security (no db push in production, named volumes), JSON.parse try/catch, input validation (email, password min 8, phone), SameSite=Strict cookie.

Phase 3 — Low Priority: Stronger seed passwords, generated 256-bit NEXTAUTH_SECRET.

11. Seed Data

Seed scripts create 4 users (superadmin, admin, 2 customers — password: Dev@123$Test#2026), 5 categories (bilingual TH/EN), and 15 products (3 per category) with 6 images and 1 video each. Safety checks prevent overwriting existing data.

This page serves as a detailed technical reference for the Neno Jewelry Store system architecture and implementation.
