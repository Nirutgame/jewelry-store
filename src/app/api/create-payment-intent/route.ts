import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`create-payment:${ip}`, 5, 60000);
  if (!success) {
    return NextResponse.json({ message: "โปรดลองอีกครั้งภายหลัง" }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const stripeKey = process.env.STRIPE_SECRET_KEY || "";
  if (!stripeKey || stripeKey.includes("placeholder")) {
    return NextResponse.json({ message: "Stripe ยังไม่ได้ตั้งค่า กรุณาใช้โอนเงินแทน" }, { status: 400 });
  }

  try {
    const { items, firstName, lastName, email, phone, address, district, province, zipcode, note, promoCode } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    let rawTotal = 0;
    const verifiedItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ message: `ไม่พบสินค้า` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `สินค้า "${product.name}" มีเพียง ${product.stock} ชิ้นในสต็อก` }, { status: 400 });
      }
      rawTotal += product.price * item.quantity;
      verifiedItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }

    let discountAmount = 0;
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      });
      if (promo && promo.isActive && promo.expiresAt > new Date() && promo.usedCount < promo.maxUsage && rawTotal >= promo.minOrder) {
        discountAmount = promo.discountType === "percentage"
          ? Math.round(rawTotal * (promo.discountValue / 100))
          : promo.discountValue;
        if (discountAmount > rawTotal) discountAmount = rawTotal;
      }
    }
    const finalTotal = Math.max(0, rawTotal - discountAmount);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(finalTotal * 100),
      currency: "thb",
      metadata: {
        userId,
        rawTotal: rawTotal.toString(),
        discount: discountAmount.toString(),
        promoCode: promoCode || "",
        items: JSON.stringify(verifiedItems),
        shipping: JSON.stringify({ firstName, lastName, email, phone, address, district, province, zipcode, note }),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch {
    return NextResponse.json({ message: "Failed to create payment intent" }, { status: 500 });
  }
}
