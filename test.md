# Jewelry Store - Test Documentation

## Project Overview
Next.js 14 e-commerce platform for jewelry with Prisma (SQLite), Stripe payment, and NextAuth authentication.

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Auth**: NextAuth.js with bcrypt
- **Payment**: Stripe + Bank Transfer (slip upload)
- **Database**: SQLite (via Prisma)

## Key Features
- Product catalog with categories
- Shopping cart
- Checkout (credit card + bank transfer)
- User authentication (login/register)
- Order history with slip upload
- Wishlist
- Admin dashboard (manage products, orders, promotions)

## Getting Started

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Project Structure
```
src/
├── app/          # App Router pages
│   ├── admin/    # Admin panel
│   ├── api/      # REST API routes
│   ├── auth/     # Login/Register
│   ├── cart/     # Shopping cart
│   ├── checkout/ # Checkout flow
│   ├── orders/   # Order history
│   ├── products/ # Product listing/detail
│   └── wishlist/ # Wishlist
├── components/   # Shared components
├── lib/          # Utilities and config
└── types/        # TypeScript types
```
