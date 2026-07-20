# Neno Jewelry Store — Development Plan (Phase 4-9)

> **Updated:** 21 July 2026
> 
> เอกสารนี้เป็นแผนพัฒนาระบบระยะถัดไป ครอบคลุมตั้งแต่ Cart → Payment → Order → Dashboard → Security → Deployment
> แต่ละ Phase มีรายละเอียดไฟล์ โครงสร้างข้อมูล API และทางเลือกในการออกแบบ

---

## ✅ สรุปสิ่งที่ทำเสร็จแล้ว (Phase 0-3 + Features)

| หมวด | รายละเอียด |
|------|-----------|
| 🔒 Security | 27 รายการ (Auth, Rate Limit, CSP, OTP Hash, SameSite, ฯลฯ) |
| 🎨 UI/UX | Navbar responsive, Admin FAB, mobile scroll fix, Thai font |
| 📸 Media | Image upload 6 รูป/สินค้า, Video upload 1 video/สินค้า |
| 🏪 Company Profile | SiteSetting model, Admin settings page, Logo upload, SSR logo |
| 🐳 Infra | WSL systemd, Docker named volumes, localhostForwarding |
| 📝 Docs | readme-struc.md, readme-stack.md, readme-plan.md |

---

# PHASE 4 — Cart → Checkout → Stripe Payment

> **เวลา:** 2-3 วัน | **ไฟล์:** ~12 ไฟล์ | **Priority:** 🔴 HIGH

---

## 4a. Guest Cart + Cart Context

### ปัญหา
ปัจจุบัน Cart ใช้ API กับ DB (`CartItem` model) → ต้อง login ก่อนถึงจะเพิ่มสินค้าในตะกร้าได้  
→ User ที่ยังไม่ login จะใช้ตะกร้าไม่ได้ → เสียโอกาสขาย

### วิธีแก้
สร้าง `CartContext` (React Context) + `guestCart` ใน localStorage

### Data Flow

```
User ยังไม่ login:
  Add to Cart → CartContext → localStorage → แสดงในหน้า Cart

User login แล้ว:
  CartContext → merge localStorage + DB CartItem → ลบ localStorage → ใช้ DB ต่อ
```

### ไฟล์ที่ต้องสร้าง/แก้

#### 1. `src/context/CartContext.tsx` (ใหม่)

```typescript
interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void;
  total: number;
  itemCount: number;
  loading: boolean;
}
```

**หน้าที่ของ Context:**
- ถ้า `session` มี → ใช้ API (DB)
- ถ้า `session` ไม่มี → ใช้ localStorage
- ตอน login → merge: localStorage items + DB items → save to DB
- ตอน logout → clear context → กลับไปใช้ localStorage

#### 2. `src/app/providers.tsx` (แก้)

เพิ่ม `CartProvider` ครอบ children

#### 3. `src/components/ProductCard.tsx` (แก้)

| บรรทัด | ปัจจุบัน | เปลี่ยนเป็น |
|--------|---------|------------|
| 16 | `onAddToCart?: (productId: string) => void` | ใช้ `CartContext.addItem()` แทน prop |

#### 4. `src/app/products/[id]/page.tsx` (แก้)

| บรรทัด | ปัจจุบัน | เปลี่ยนเป็น |
|--------|---------|------------|
| ~305 | `handleAddToCart` → fetch POST `/api/cart` | ใช้ `CartContext.addItem()` |

#### 5. `src/app/cart/page.tsx` (แก้)

เพิ่ม guest cart UI: ถ้าไม่ login → แสดง items จาก localStorage  
ถ้า login → แสดง items จาก API (เหมือนเดิม)

#### 6. `src/app/api/cart/route.ts` (แก้)

- `POST` → ถ้า product มีอยู่ใน localStorage แล้ว → สร้างใน DB
- `GET` → merge localStorage items + DB items → return รวมกัน

### Option: Alternative Approach

| วิธี | ข้อดี | ข้อเสีย |
|------|------|--------|
| **A: CartContext + localStorage** (แนะนำ) | ใช้ได้ทันที, UX ดี, ไม่ต้อง login | Context ซับซ้อน, merge logic |
| **B: Server-side temporary cart** (sessionId) | ไม่ต้อง context, ใช้ API ล้วน | ต้องจัดการ session cookie, offline ไม่ได้ |
| **C: Guest cart → login → redirect to cart** (ง่ายสุด) | แก้น้อย, ใช้ API เดิม | UX แย่, user ต้อง login ก่อนถึงจะ add cart ได้ |

---

## 4b. Checkout Enhancement

### ไฟล์ที่ต้องแก้

#### 1. `src/app/checkout/page.tsx` (แก้)

**Auto-fill shipping form** (บรรทัด ~100-150):

```typescript
useEffect(() => {
  if (session) {
    fetch("/api/settings") // หรือ /api/auth/session เพื่อหาที่อยู่
      .then(r => r.json())
      .then(data => {
        if (data.phone) setPhone(data.phone);
        if (data.address) setAddress(data.address);
        // ...
      });
  }
}, [session]);
```

ขั้นตอน:
- ถ้า login → ดึง address จาก User model (phone, address, district, province, zipcode)
- ถ้าไม่ login → ให้กรอกฟอร์มเปล่า
- ทุกกรณี → user สามารถแก้ไข address ได้

**Promo code validation** (บรรทัด ~50-80):

```typescript
const handleApplyPromo = async () => {
  const res = await fetch("/api/promo/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: promoInput, cartTotal: total }),
  });
  const data = await res.json();
  if (data.valid) {
    setPromoDiscount(data.discount);
    setAppliedPromo(data.code);
  } else {
    setPromoError(data.message);
  }
};
```

**Payment method selection:**

```typescript
type PaymentMethod = "card" | "bank_transfer";
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
```

UI:
```
┌─ ชำระเงิน ─────────────────────┐
│  ○ บัตรเครดิต/เดบิต (Stripe)    │
│  ○ โอนเงิน (พร้อมเพย์ / โอนทั่วไป)│
└─────────────────────────────────┘
```

---

## 4c. Stripe Payment Integration

### Data Flow

```
User กรอกข้อมูล + เลือกชำระ → Submit
  │
  ├─ ถ้าเลือก "card"
  │   ├─ POST /api/create-payment-intent → Stripe PaymentIntent
  │   ├─ Stripe Elements → กรอกเลขบัตร
  │   ├─ confirmPayment → Stripe confirms
  │   └─ POST /api/confirm-payment → Create Order
  │
  └─ ถ้าเลือก "bank_transfer"
      ├─ POST /api/orders → Create Order (paymentStatus = "pending")
      └─ แสดง QR / เลขบัญชี + ให้อัปโหลด slip
```

### ไฟล์ที่ต้องแก้

#### 1. `src/app/checkout/page.tsx` (แก้)

**Bank transfer UI:**

```tsx
{bankInfo && (
  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
    <p className="font-medium">โอนเงินไปที่:</p>
    <p>ธนาคาร: {bankInfo.bankName}</p>
    <p>ชื่อบัญชี: {bankInfo.accountName}</p>
    <p>เลขที่: {bankInfo.accountNumber}</p>
    <p className="text-xs text-gray-500 mt-2">อัปโหลดสลิปหลังจากโอนเงิน</p>
  </div>
)}
```

#### 2. `src/app/api/orders/route.ts` (POST — แก้)

- ปัจจุบันมี logic สร้าง order + stock decrement + clear cart อยู่แล้ว
- ต้องเพิ่ม: ให้รองรับ `paymentMethod = "bank_transfer"` โดยกำหนด `paymentStatus = "pending"`
- และใช้ address ที่ส่งมาจาก checkout form (แทนที่จะเก็บเฉพาะ order)

#### 3. `src/app/api/stripe/webhook/route.ts` (ตรวจสอบ)

- ปัจจุบันมี webhook handler อยู่แล้ว
- ตรวจสอบว่า `payment_intent.succeeded` → update `paymentStatus` + `paymentConfirmedAt`

#### 4. Stripe test keys

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

### Payment Method Comparison

| วิธี | ข้อดี | ข้อเสีย |
|------|------|--------|
| **Stripe Card** | จ่ายทันที, auto confirm | ต้องมี Stripe account, มีค่าธรรมเนียม |
| **Bank Transfer** | ไม่มีค่าธรรมเนียม, คนไทยคุ้นเคย | รอ admin confirm, user ต้องอัปโหลด slip |

---

# PHASE 5 — Order Management

> **เวลา:** 1-2 วัน | **ไฟล์:** ~8 ไฟล์ | **Priority:** 🟡 MEDIUM

---

## 5a. User Order Detail + Timeline

### ไฟล์ที่ต้องแก้

#### 1. `src/app/orders/[id]/page.tsx` (แก้)

เพิ่ม **Order Timeline**:

```tsx
const statusSteps = [
  { key: "pending", label: "รอดำเนินการ", icon: HiOutlineClock },
  { key: "confirmed", label: "ยืนยันแล้ว", icon: HiOutlineCheck },
  { key: "shipping", label: "กำลังจัดส่ง", icon: HiOutlineTruck },
  { key: "delivered", label: "จัดส่งแล้ว", icon: HiOutlineHome },
];

// UI:
{statusSteps.map((step, i) => (
  <div className={`flex items-center gap-3 ${orderStatusIndex >= i ? "text-gold-600" : "text-gray-400"}`}>
    <step.icon />
    <span>{step.label}</span>
  </div>
))}
```

**Cancel order:**

```typescript
const handleCancel = async () => {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled" }),
  });
};
```

เงื่อนไข: ยกเลิกได้เฉพาะ status = `pending` (ยังไม่ confirmed)

#### 2. `src/app/api/orders/[id]/route.ts` (ใหม่หรือแก้)

`PATCH /api/orders/[id]` — เปลี่ยน status (user: cancel, admin: confirm/shipping/deliver)

---

## 5b. Admin Order Management

### ไฟล์ที่ต้องแก้

#### 1. `src/app/admin/orders/[id]/page.tsx` (แก้)

เพิ่ม actions:
```
┌─ Actions ─────────────────────┐
│  [✓ ยืนยัน] [📦 จัดส่ง]        │
│  [🏠 จัดส่งแล้ว] [✕ ยกเลิก]   │
│                                │
│  Tracking Number: [__________] │
│  [💾 บันทึก]                   │
└────────────────────────────────┘
```

**Status flow:**

```
pending → confirmed → shipping → delivered
           ↘ cancelled
```

#### 2. `src/app/admin/orders/page.tsx` (แก้)

เพิ่ม filter:
```typescript
const statusTabs = ["all", "pending", "confirmed", "shipping", "delivered", "cancelled"];
```

UI:
```
[ ทั้งหมด ] [ รอดำเนินการ ] [ ยืนยันแล้ว ] [ กำลังจัดส่ง ] [ จัดส่งแล้ว ] [ ยกเลิก ]
```

#### 3. `src/app/api/admin/orders/route.ts` (GET — ตรวจสอบ)

GET ต้องรองรับ query params:
- `?status=pending` → filter by status
- `?startDate=...&endDate=...` → filter by date range (อาจไม่ต้องใน Phase นี้)

---

## 5c. Email + LINE Notifications

### ไฟล์ที่ต้องแก้

#### 1. `src/lib/email.ts` (แก้)

ตรวจสอบ templates:
| Template | Status | หมายเหตุ |
|----------|--------|----------|
| `sendOrderConfirmationEmail` | ✅ มีแล้ว | ใช้ตอน order ถูกสร้าง |
| `sendOrderStatusEmail` | ✅ มีแล้ว | ใช้ตอน status เปลี่ยน |
| `sendPasswordResetEmail` | ✅ มีแล้ว | |
| `sendOtpEmail` | ✅ มีแล้ว | |

อาจต้องปรับ content ของ email ให้ใช้ `settings.storeName` แทน hardcoded "Lumière"

#### 2. `src/lib/line-notify.ts` (ตรวจสอบ)

`notifyNewOrder` — ✅ มีแล้ว  
`notifySlipUpload` — ✅ มีแล้ว  
`notifyStatusChange` — อาจต้องเพิ่ม (แจ้ง admin เมื่อ order status เปลี่ยน)

---

# PHASE 6 — Admin Dashboard + Analytics

> **เวลา:** 1-2 วัน | **ไฟล์:** ~5 ไฟล์ | **Priority:** 🟡 MEDIUM

---

## 6a. Dashboard Enhancement

### ไฟล์ที่ต้องแก้

#### 1. `src/app/admin/page.tsx` (แก้)

**Auto-refresh stats:**

```typescript
useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 30000); // refresh every 30s
  return () => clearInterval(interval);
}, []);
```

**Charts:** ปัจจุบันมี Recharts อยู่แล้ว  
| Chart | Data source | สถานะ |
|-------|------------|--------|
| Revenue bar chart | `analytics.monthlyRevenue` | ✅ มีแล้ว |
| Status pie chart | `analytics.statusBreakdown` | ✅ มีแล้ว |
| Top products | `analytics.topProducts` | ✅ มีแล้ว |
| Customer growth | `analytics.customerGrowth` | ✅ มีแล้ว |

#### 2. `src/app/api/admin/analytics/route.ts` (ตรวจสอบ)

ตรวจสอบว่า API ทำงานถูกต้องหรือไม่ — อาจต้อง debug ถ้า charts ไม่แสดง

---

## 6b. Export Data

### ไฟล์ที่ต้องสร้าง

#### 1. `src/app/api/admin/export/orders/route.ts` (ใหม่)

```typescript
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const orders = await prisma.order.findMany({
    where: {
      ...(startDate && endDate ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } : {}),
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  // Convert to CSV
  const csv = [
    "Order ID,Date,Customer,Total,Status,Items",
    ...orders.map(o =>
      `${o.id.slice(0, 8)},${o.createdAt.toISOString()},"${o.firstName} ${o.lastName}",${o.total},${o.status},${o.items.length}`
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=orders.csv",
    },
  });
}
```

#### 2. `src/app/api/admin/export/customers/route.ts` (ใหม่)

รูปแบบเดียวกับ orders export แต่ส่ง customer data

#### 3. Admin UI — ปุ่ม Export

เพิ่มใน `src/app/admin/page.tsx` หรือ `src/app/admin/orders/page.tsx`:

```tsx
<button onClick={() => window.open("/api/admin/export/orders")} className="btn-secondary">
  📥 Export CSV
</button>
```

---

# PHASE 7 — Security + PDPA

> **เวลา:** 2-3 วัน | **ไฟล์:** ~8 ไฟล์ | **Priority:** 🟢 LOW

---

## 7a. PII Encryption (AES-256-GCM)

### หลักการ

```
Plaintext → encrypt(key, iv) → ciphertext + iv (base64) → DB
DB → ciphertext + iv → decrypt(key, iv) → Plaintext → API Response
```

### ไฟล์ที่ต้องสร้าง/แก้

#### 1. `src/lib/crypto.ts` (ใหม่)

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex"); // 32 bytes = 64 hex chars
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encoded: string): string {
  const [ivHex, authTagHex, encrypted] = encoded.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

#### 2. `prisma/schema.prisma` (แก้)

เพิ่ม `emailHash` ใน User model:
```prisma
model User {
  ...
  email     String
  emailHash String?  // SHA-256(email) ไว้ค้นหา
  phone     String?  // encrypted
  address   String?  // encrypted
  ...
}
```

#### 3. `src/lib/prisma.ts` (แก้)

เพิ่ม Prisma middleware:

```typescript
import { encrypt, decrypt } from "./crypto";

const PII_FIELDS = ["phone", "address", "district", "province", "zipcode"];

prisma.$use(async (params, next) => {
  // Encrypt on create/update
  if (params.action === "create" || params.action === "update") {
    for (const field of PII_FIELDS) {
      if (params.args.data?.[field]) {
        params.args.data[field] = encrypt(params.args.data[field]);
      }
    }
  }

  const result = await next(params);

  // Decrypt on find
  if (params.action.startsWith("find")) {
    if (Array.isArray(result)) {
      for (const row of result) {
        for (const field of PII_FIELDS) {
          if (row[field]) {
            try { row[field] = decrypt(row[field]); } catch {}
          }
        }
      }
    } else if (result) {
      for (const field of PII_FIELDS) {
        if (result[field]) {
          try { result[field] = decrypt(result[field]); } catch {}
        }
      }
    }
  }

  return result;
});
```

#### 4. `src/lib/auth.ts` (แก้)

Login flow: ใช้ `emailHash` แทน `email` ในการค้นหา user:

```typescript
const hashedEmail = createHash("sha256").update(credentials.email).digest("hex");
const user = await prisma.user.findUnique({
  where: { emailHash: hashedEmail },
});
```

#### 5. `.env` (แก้)

```env
ENCRYPTION_KEY=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
```

สร้าง key: `openssl rand -hex 32`

#### 6. `prisma/seed-settings.js` (แก้)

Seed ต้องมี `emailHash` ด้วย (ไม่งั้น login ไม่ได้):

```javascript
const { createHash } = require("crypto");
// ...
data: {
  email: encrypt("admin@lumiere.com"),
  emailHash: createHash("sha256").update("admin@lumiere.com").digest("hex"),
  // ...
}
```

### ⚠️ ข้อพึงระวัง

| ปัญหา | ผลกระทบ | วิธีแก้ |
|--------|---------|--------|
| `findUnique({ where: { email } })` ใช้ไม่ได้ | login, register, forgot-password พัง | ใช้ `emailHash` แทน |
| `findMany({ where: { phone: { contains: "..." } } })` ใช้ไม่ได้ | search ด้วย phone ใช้ไม่ได้ | จำกัดการค้นหาเฉพาะ email/name |
| Key หาย → ข้อมูลถอดรหัสไม่ได้ | Data loss | Backup key ไว้ปลอดภัย |
| Performance overhead | Query ช้าลง ~10-20% | เฉพาะ PII fields เท่านั้น |

---

## 7b. PDPA Compliance

### ไฟล์ที่ต้องสร้าง/แก้

#### 1. `src/app/privacy/page.tsx` (ใหม่)

นโยบายความเป็นส่วนตัว — เนื้อหาครอบคลุม:
- ข้อมูลอะไรที่เก็บ
- ใช้ข้อมูลเพื่ออะไร
- เก็บข้อมูลนานแค่ไหน  
- สิทธิของเจ้าของข้อมูล
- ช่องทางติดต่อ

#### 2. `src/app/auth/register/page.tsx` (แก้)

เพิ่ม Checkbox ยอมรับนโยบาย:

```tsx
<div className="flex items-start gap-2">
  <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
  <label htmlFor="consent" className="text-sm text-gray-500">
    ยอมรับ{" "}
    <Link href="/privacy" className="text-gold-600 hover:underline">
      นโยบายความเป็นส่วนตัว
    </Link>
  </label>
</div>
```

#### 3. `src/app/user/data/page.tsx` (ใหม่)

ให้ user ดาวน์โหลดข้อมูลตัวเอง:
- Export orders
- Export personal info

#### 4. `src/app/user/delete/page.tsx` (ใหม่)

ให้ user ลบบัญชีตัวเอง:
```typescript
const handleDelete = async () => {
  // 1. Anonymize orders (ลบข้อมูลส่วนตัวใน order)
  // 2. ลบ user (หรือ anonymize)
  // 3. Sign out
};
```

---

## 7c. Rate Limiting Upgrade (Redis)

### ปัญหา
Rate limiter ปัจจุบันใช้ in-memory Map → 
- รีเซ็ตเมื่อ server restart
- ใช้ร่วมกันหลาย instance ไม่ได้
- Memory leak ถ้ามี keys มาก (มี cleanup แล้ว แต่ยัง leak ได้)

### วิธีแก้
ใช้ Redis เป็น backend สำหรับ rate limiter

### ไฟล์ที่ต้องแก้

#### 1. `src/lib/rate-limit.ts` (แก้)

```typescript
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
await redis.connect();

export async function rateLimit(key: string, limit = 10, windowMs = 60000): Promise<{ success: boolean }> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.pExpire(key, windowMs);
  }
  return { success: count <= limit };
}
```

### ข้อดี/ข้อเสีย Redis

| ข้อดี | ข้อเสีย |
|------|--------|
| ✅ Persistent (ไม่หายถ้า restart) | ❌ ต้องติดตั้ง Redis เพิ่ม |
| ✅ Shared ข้าม instance | ❌ เพิ่ม dependency |
| ✅ No memory leak | ❌ Network latency (เล็กน้อย) |
| ✅ Expire อัตโนมัติ | ❌ เพิ่ม cost (RAM) |

### Option: ใช้ Redis แบบ Cloud
| Service | Free tier | Price |
|---------|-----------|-------|
| **Redis Cloud** | 30MB | $0 |
| **Upstash** | 10MB, 10k commands/day | $0 |
| **Self-hosted (Docker)** | ไม่จำกัด | ใช้ RAM ของ server |

---

# PHASE 8 — Performance + Testing

> **เวลา:** 2-3 วัน | **ไฟล์:** ~15 ไฟล์ | **Priority:** 🟢 LOW

---

## 8a. Next.js Optimization

### 1. Image Optimization

**เปลี่ยนจาก `<img>` → `<Image>`:**

```tsx
// ก่อน
<img src={url} className="w-full h-full object-cover" />

// หลัง
import Image from "next/image";
<Image src={url} alt="" width={400} height={400} className="object-cover" />
```

ไฟล์ที่ต้องแก้ (~15 ไฟล์):
- `ProductCard.tsx`
- `Navbar.tsx` (logo)
- `CartItem.tsx`
- `products/[id]/page.tsx`
- `admin/categories/page.tsx`
- `admin/products/page.tsx`
- `admin/products/[id]/edit/page.tsx`
- `admin/orders/[id]/page.tsx`
- ฯลฯ

### 2. Static Generation (ISR)

สำหรับ product detail pages: ใช้ `generateStaticParams` + `revalidate`

```typescript
// src/app/products/[id]/page.tsx
export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { id: true } });
  return products.map(p => ({ id: p.id }));
}

export const revalidate = 60; // re-generate every 60 seconds
```

ข้อควรระวัง: หน้านี้เป็น `"use client"` → ต้องแยก Server/Client component

---

## 8b. Testing

### Stack ที่แนะนำ
| เครื่องมือ | ใช้ทดสอบ |
|-----------|---------|
| **Jest** | Unit tests |
| **React Testing Library** | Component tests |
| **Supertest** | API route tests |
| **Playwright** | E2E tests (browser) |

### Test Structure

```
__tests__/
├── components/
│   ├── Navbar.test.tsx
│   ├── ProductCard.test.tsx
│   └── CartItem.test.tsx
├── api/
│   ├── products.test.ts
│   ├── auth.test.ts
│   └── orders.test.ts
└── e2e/
    ├── login.spec.ts
    ├── checkout.spec.ts
    └── admin.spec.ts
```

### API Test ตัวอย่าง

```typescript
// __tests__/api/products.test.ts
import { createMocks } from "node-mocks-http";
import handler from "@/app/api/products/route";

describe("GET /api/products", () => {
  it("returns 200 with products array", async () => {
    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data.products)).toBe(true);
  });
});
```

---

## 8c. CI/CD (GitHub Actions)

### `.github/workflows/ci.yml` (ใหม่)

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: jewelry_store
        ports: ["5432:5432"]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma db push
      - run: npm test
```

---

# PHASE 9 — Deployment

> **เวลา:** 1-2 วัน | **ไฟล์:** ~5 ไฟล์ | **Priority:** 🟡 MEDIUM

---

## 9a. Docker Production

### `Dockerfile` (แก้ — ปัจจุบันมีแล้ว ต้องปรับ)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
```

**ข้อแตกต่างจาก Dockerfile ปัจจุบัน:**
- ใช้ `node:20-alpine` (เล็กลง ~200MB)
- ไม่มี `prisma db push` (production schema ต้อง migrate ก่อน)
- ใช้ `next start` (production mode, ไม่ใช่ dev)

### `docker-compose.prod.yml` (ใหม่)

```yaml
services:
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: jewelry_store
    restart: unless-stopped

  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/jewelry_store
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    restart: unless-stopped

volumes:
  pgdata:
```

---

## 9b. Domain + SSL

### ตัวเลือก Reverse Proxy

| ตัวเลือก | ข้อดี | ข้อเสีย |
|---------|------|--------|
| **Caddy** | Auto SSL (Let's Encrypt), ตั้งค่าง่าย | คนใช้น้อยกว่า Nginx |
| **Nginx + Certbot** | คนใช้มาก, community เยอะ | ตั้งค่าซับซ้อนกว่า |
| **Cloudflare Tunnel** | ไม่ต้องเปิด port, SSL auto | ต้องใช้ Cloudflare DNS |

### ตัวอย่าง Caddyfile

```
neno-jewelry.com {
    reverse_proxy localhost:3000
}
```

---

## 9c. VPS Provider Comparison

| Provider | RAM | CPU | SSD | Price/เดือน | Notes |
|----------|-----|-----|-----|-----------|-------|
| **Hetzner** | 4GB | 2 vCPU | 80GB | ~$8 | คุ้มที่สุด |
| **DigitalOcean** | 2GB | 2 vCPU | 50GB | ~$15 | ใช้งานง่าย |
| **Vultr** | 2GB | 1 vCPU | 55GB | ~$12 | |
| **AWS Lightsail** | 2GB | 2 vCPU | 80GB | ~$12 | |
| **Oracle Cloud** | 24GB | 4 OCPU | 200GB | **ฟรี** | ต้องใช้บัตรเครดิตสมัคร |

**แนะนำ:** Oracle Cloud Free Tier → 24GB RAM ฟรี! (แต่สมัครยากหน่อย)  
หรือ Hetzner ~$8/เดือน สำหรับโปรเจกต์นี้เกินพอ

---

## 📊 Timeline — สรุป

```
Week 1:  ████████████████░░░░░░░░░░░░░░░░░░░░  Phase 4 (Cart→Payment) ~12 ไฟล์
Week 2:  ████████████████████████████░░░░░░░░░░  Phase 5+6 (Order+Dashboard) ~13 ไฟล์
Week 3:  ░░░░░░░░░░░░░░░░░░░░░░░░░░████████████  Phase 7 (PDPA) ~8 ไฟล์
Week 4:  ████████████████░░░░░░░░░░░░░░░░░░░░  Phase 8 (Testing+CI) ~15 ไฟล์
Week 5:  ░░░░░░░░░░░░░░░░░░░█░░░░░░░░░░░░░░░░  Phase 9 (Deploy) ~5 ไฟล์
```

**รวมทั้งหมด: ~50 ไฟล์ | ~10-15 วันทำการ | ~2-3 สัปดาห์ตามปฏิทิน**

---

## 💡 Design Decisions รอ Confirm

| ข้อ | ตัวเลือก |
|-----|---------|
| **Guest cart** | Context + localStorage หรือ session-based? |
| **Bank transfer** | เก็บเลขบัญชีใน env หรือใน SiteSetting? |
| **PII Encryption** | ทำตอนนี้หรือรอ launch จริง? |
| **Testing** | Unit test อย่างเดียว หรือรวม E2E? |
| **Deploy target** | VPS (Hetzner) หรือ Cloud (Railway/Render)? |

---

*เอกสารนี้เป็นแผนฉบับสมบูรณ์ — พร้อมให้คุณอ่านและตัดสินใจในแต่ละ Phase ครับ*
