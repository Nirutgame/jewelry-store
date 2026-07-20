# Neno Jewelry Store — Known Bugs & Issues

> **Updated:** 21 July 2026
>
> รายการบั๊กและปัญหาที่พบระหว่างการพัฒนา รอการแก้ไขตามลำดับความสำคัญ

---

## 🔴 CRITICAL

| # | ปัญหา | ไฟล์ | รายละเอียด | ผลกระทบ |
|---|-------|------|-----------|---------|
| 1 | **Checkout: Stripe key placeholder** | `.env` | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ยังเป็น `_placeholder` | ไม่สามารถชำระผ่านบัตรเครดิตได้ |
| 2 | **Checkout: /api/settings call ซ้ำ** | `checkout/page.tsx` | `useEffect` dependency `cartLoading` ทำให้เรียก `/api/settings` หลายครั้ง | (แก้ไขแล้วบางส่วน) |
| 3 | **CartContext: updateQuantity dependency** | `CartContext.tsx:187,205` | `useCallback` missing `items` dependency → stale closure | +/- อาจไม่ reflect ทันที |

---

## 🟡 HIGH

| # | ปัญหา | ไฟล์ | รายละเอียด |
|---|-------|------|-----------|
| 4 | **Checkout summary: promoCode/promoDiscount ไม่แสดง** | `checkout/page.tsx:515-534` | `promoCode`, `promoDiscount` ถูกเก็บใน DB แต่ไม่แสดงใน Order summary |
| 5 | **Order detail (user): "Total" = 0** | `orders/[id]/page.tsx:155-168` | Middle "Total" เป็น `formatPrice(0)` hardcoded — ไม่มี discount/promo |
| 6 | **Admin order: toast error message** | `admin/orders/[id]/page.tsx:51,54` | `addToast(t("checkout.total"), "error")` แสดง "ยอดสุทธิ" แทนข้อความ error ที่ถูกต้อง |
| 7 | **Cart: CartItemType mismatch** | `cart/page.tsx` | ใช้ `CartItemData` (จาก CartContext) แต่ component `CartItem` ใช้ `CartItemType` — อาจมี type mismatch |
| 8 | **OrderType missing promoCode/promoDiscount** | `types/index.ts` | `OrderType` interface ไม่มี field `promoCode`, `promoDiscount` → UI ไม่เคยแสดง |

---

## 🟢 LOW / COSMETIC

| # | ปัญหา | ไฟล์ | รายละเอียด |
|---|-------|------|-----------|
| 9 | **WSL localhost forwarding** | WSL | `localhostForwarding` intermittent — บางครั้งใช้ `localhost:3000` ไม่ได้ ต้องใช้ LAN IP แทน |
| 10 | **Checkout: "Total" translation key ผิด** | `checkout/page.tsx` หลายบรรทัด | `t("checkout.total")` ใช้ผิดที่เป็น error message แทนที่จะเป็น error key |
| 11 | **Admin customer: unnecessary type casts** | `admin/orders/[id]/page.tsx:199,291` | `(order as { paymentMethod?: string }).paymentMethod` — type casts ที่ไม่จำเป็น |
| 12 | **Navbar logo SSR flash** | `Navbar.tsx` | `useState(ssrLogoUrl)` + `useEffect` → logo อาจกระพริบตอน refresh (แก้แล้วบางส่วน) |

---

## 📋 TODO — Feature ที่ยังไม่เริ่ม

| # | Feature | Priority | หมายเหตุ |
|---|---------|----------|---------|
| A | **Guest cart → Merge → Checkout flow** (E2E) | 🟡 HIGH | ต้อง test จริงว่าการ merge ไม่ทำให้สินค้าหาย |
| B | **Order status timeline** | 🟡 HIGH | เพิ่ม timeline UI ให้ user เห็นสถานะ |
| C | **Cancel order (user)** | 🟡 HIGH | ต้องมี API `PATCH /api/orders/[id]` สำหรับ user ยกเลิก |
| D | **LINE Notify ปิดบริการแล้ว** | 🟢 LOW | ต้องเปลี่ยนไปใช้ LINE Messaging API หรือ Email อย่างเดียว |
| E | **Stripe real keys** | 🟡 HIGH | ต้องใส่ Stripe test keys จริง ก่อน launch |

---

## 🔧 วิธี Reproduce

### Bug #4 — Promo code not shown in summary
1. Add product to cart → Go to checkout
2. Enter promo code → Apply
3. Discount shows in summary (คอลซ้าย)
4. หลังจาก order ถูกสร้าง → ไปดู `/orders/[id]` → ไม่มี promo/discount แสดง

### Bug #5 — Order detail shows Total = 0
1. Place an order (bank_transfer)
2. Go to `/orders/[id]`
3. See middle "Total" row shows "0 บาท"

---

## 📝 Notes

- Stripe key ต้องเป็น key จริงจาก Stripe Dashboard (test mode) ก่อน launch
- ระบบ Rate Limiter ยังเป็น in-memory — ควรเปลี่ยนเป็น Redis สำหรับ production
- PII Encryption (AES-256-GCM) — รอ Phase 7
