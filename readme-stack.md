Lumière Jewelry Store — System Architecture

This page provides a comprehensive overview of the Lumière Jewelry Store system architecture, including its technology stack, database schema, API routes, page structure, authentication flow, external services, and deployment details.

1. Tech Stack

The system is built using modern technologies:

Framework: Next.js 14 with App Router and TypeScript 5.4

Database: PostgreSQL 16 with Prisma ORM 5.14

Authentication: NextAuth.js 4 with Credentials Provider and JWT, using bcryptjs for password hashing

Styling: Tailwind CSS 3.4 with dark mode support

Payment: Stripe integration with Payment Intents and Webhooks

Email: Nodemailer SMTP (Gmail/Outlook) with Resend fallback

Image Upload: Cloudinary with local filesystem fallback

Notifications: LINE Notify API

Charts: Recharts

Icons: react-icons (Heroicons)

Containerization: Docker and Docker Compose

2. Database Schema

The database schema includes models for User, Product, CartItem, Order, OrderItem, WishlistItem, Review, CategoryMeta, PromoCode, OtpToken, OtpLog, and PasswordResetToken. Relationships are defined between users and their cart items, orders, wishlist items, and reviews, as well as products linked to these entities.

3. API Routes

The system exposes various API routes for public and admin use, including authentication, product management, cart and order handling, wishlist, promo code validation, contact form submission, image uploads, and payment processing.

4. Pages (Routes)

The application includes public pages such as home, product listings, cart, checkout, orders, wishlist, about, and contact, as well as authentication pages and admin pages for managing products, orders, customers, categories, promo codes, reviews, and users.

5. Component Structure

Key components include Navbar, Footer, ProductCard, ProductGrid, CartItem, StripePayment, StarRating, ThemeToggle, and Toast notifications. Layouts are structured for both public and admin interfaces.

6. Authentication Flow

Authentication supports password login and OTP login flows, with route protection based on user roles (customer, admin, superadmin).

7. External Services

The system integrates with Stripe for payments, Cloudinary for image hosting, Resend and Nodemailer for email, and LINE Notify for notifications.

8. Docker Deployment

Deployment is managed via Docker and Docker Compose with separate configurations for production and development environments.

9. Key Architectural Patterns

Patterns include server/client component separation, Prisma singleton for database connections, role-based guards, rate limiting, bilingual support, dark mode, transactional order creation, Stripe dual payment flow, local file upload fallback, OTP authentication, session management, and seed data safety.

10. Seed Data

Seed scripts create initial users, categories, and products with safety checks to avoid overwriting existing data.

This page serves as a detailed technical reference for the Lumière Jewelry Store system architecture and implementation.