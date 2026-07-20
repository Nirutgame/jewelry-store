# Neno Jewelry Store — Development Plan (Phase 4-9)

---

## ✅ Completed Phases

| Phase | Status |
|---|---|
| 0 — Emergency (Revoke keys, purge .env) | ✅ |
| 1 — High Priority Security | ✅ |
| 2 — Medium Priority Security | ✅ |
| 3 — Low Priority + Features | ✅ |
| Company Profile + Logo | ✅ |
| Thai Font (Noto Sans Thai) | ✅ |
| Navbar/Admin Responsive | ✅ |
| WSL/Docker Setup | ✅ |

---

## 📅 Phase 4 — Cart → Checkout → Stripe Payment

**เวลาประมาณ:** 2-3 วัน | **Priority:** 🔴 HIGH

### 4a. Cart Enhancement
| Task | รายละเอียด | ไฟล์ |
|------|-----------|------|
| Guest cart (localStorage) | เก็บ cart ใน localStorage ถ้ายังไม่ login | `CartContext.tsx` (ใหม่) |
| Merge cart | เมื่อ login → รวม guest cart + user cart | `CartContext.tsx` |
| Stock validation | เช็ค stock ก่อน add + checkout | `cart/route.ts` |

### 4b. Checkout (ปรับปรุง)
| Task | รายละเอียด | ไฟล์ |
|------|-----------|------|
| Auto-fill address | ดึง address จาก User model มาใส่ในฟอร์ม | `checkout/page.tsx` |
| Promo code | Validate + calculate discount (server-side) | `checkout/page.tsx` |
| Order summary | Review items + total ก่อนชำระ | `checkout/page.tsx` |

### 4c. Stripe Payment
| Task | รายละเอียด | ไฟล์ |
|------|-----------|------|
| Card payment | Stripe Elements + PaymentIntent | `create-payment-intent/route.ts` |
| Bank transfer | Slip upload + รอ admin confirm | `checkout/page.tsx` |
| Confirm order | Create Order + clear cart + decrease stock | `orders/route.ts` |

---

## 📅 Phase 5 — Order Management

**เวลาประมาณ:** 1-2 วัน | **Priority:** 🟡 MEDIUM

### 5a. User Order Tracking
| Task | รายละเอียด |
|------|-----------|
| Order detail page | items, status, tracking timeline |
| Status timeline | Pending → Confirmed → Shipping → Delivered |
| Cancel order | ยกเลิกได้ถ้ายังไม่ confirmed |

### 5b. Admin Order Management
| Task | รายละเอียด |
|------|-----------|
| Update status | Confirm, ship, deliver, cancel |
| Tracking number | เพิ่ม tracking number |
| Print invoice | Packing slip / invoice |

### 5c. Notifications
| Task | รายละเอียด |
|------|-----------|
| Email on status change | Nodemailer / Resend |
| LINE Notify | แจ้ง admin เมื่อมี order ใหม่ |

---

## 📅 Phase 6 — Admin Dashboard + Analytics

**เวลาประมาณ:** 1-2 วัน | **Priority:** 🟡 MEDIUM

### 6a. Dashboard Enhancement
| Task | รายละเอียด |
|------|-----------|
| Real-time stats | Auto refresh โดยไม่ต้อง reload |
| Revenue chart | Monthly / quarterly (Recharts) |
| Top products | Best selling ranking |
| Order breakdown | Pie chart by status |

### 6b. Export Data
| Task | รายละเอียด |
|------|-----------|
| Export orders CSV | พร้อม date range filter |
| Export customers CSV | Name, email, orders count |
| Sales report | Revenue report (date range picker) |

---

## 📅 Phase 7 — Security + PDPA

**เวลาประมาณ:** 2-3 วัน | **Priority:** 🟢 LOW

### 7a. PII Encryption (AES-256-GCM)
| Task | รายละเอียด | ไฟล์ |
|------|-----------|------|
| Encrypt/decrypt utility | `encrypt(text)`, `decrypt(text)` | `src/lib/crypto.ts` (ใหม่) |
| Prisma middleware | `$use` → auto encrypt/decrypt PII fields | `src/lib/prisma.ts` |
| emailHash | SHA-256(email) ไว้ search + login | `prisma/schema.prisma` |
| Key management | `ENCRYPTION_KEY` ใน `.env` | `.env` |

### 7b. PDPA Compliance
| Task | รายละเอียด |
|------|-----------|
| Privacy Policy page | นโยบายความเป็นส่วนตัว |
| Consent checkbox | ตอน register |
| Data export | User export ข้อมูลตัวเอง |
| Account deletion | ลบข้อมูล user |

### 7c. Rate Limiting Upgrade
| Task | รายละเอียด |
|------|-----------|
| Redis upgrade | เปลี่ยนจาก in-memory → Redis |

---

## 📅 Phase 8 — Performance + Testing

**เวลาประมาณ:** 2-3 วัน | **Priority:** 🟢 LOW

### 8a. Next.js Optimization
| Task | รายละเอียด |
|------|-----------|
| Image Optimization | ใช้ `next/image` แทน `<img>` |
| ISR | Static page generation สำหรับ product pages |
| Bundle analysis | วิเคราะห์ขนาด bundle |

### 8b. Testing
| Task | รายละเอียด |
|------|-----------|
| Unit tests | Jest + React Testing Library |
| API tests | Supertest |
| E2E tests | Playwright |

### 8c. CI/CD
| Task | รายละเอียด |
|------|-----------|
| GitHub Actions | Auto test + build + deploy |
| Docker build | Automatic image build on tag |

---

## 📅 Phase 9 — Deployment

**เวลาประมาณ:** 1-2 วัน | **Priority:** 🟡 MEDIUM

### 9a. Docker Production
| Task | รายละเอียด |
|------|-----------|
| Multi-stage build | Optimized Dockerfile |
| docker-compose.prod.yml | Production compose config |
| Health check | Auto-restart on failure |

### 9b. Domain + SSL
| Task | รายละเอียด |
|------|-----------|
| Custom domain | z.B. neno-jewelry.com |
| SSL | Let's Encrypt / Cloudflare |
| Reverse proxy | Nginx / Caddy |

### 9c. VPS Deployment
| Option | Spec | Cost |
|--------|------|------|
| **DigitalOcean / Vultr** | 2GB RAM, 2 CPU, 50GB SSD | ~$15/เดือน |
| **AWS Lightsail** | 2GB RAM, 2 vCPU, 80GB SSD | ~$12/เดือน |
| **Hetzner** | 4GB RAM, 2 CPU, 80GB SSD | ~$8/เดือน (คุ้มสุด) |

---

## 📊 Timeline Overview

```
Week 1:  ████████████████░░░░░░░░░░░░  Phase 4 (Cart→Payment)
Week 2:  ░░░░░░░░░░░░░░████████████░░  Phase 5+6 (Order+Dashboard)
Week 3:  ░░░░░░░░░░░░░░░░░░░░████████  Phase 7 (PDPA)
Week 4:  ████████░░░░░░░░░░░░░░░░░░░░  Phase 8 (Testing)
Week 5:  ░░░░░░░░████████░░░░░░░░░░░░  Phase 9 (Deploy)
```

---

**Updated:** 21 July 2026
