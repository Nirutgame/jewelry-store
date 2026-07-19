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

  try {
    const { items, firstName, lastName, email, phone, address, district, province, zipcode, note, promoCode, discount } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ message: `ไม่พบสินค้า` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ message: `สินค้า "${product.name}" มีเพียง ${product.stock} ชิ้นในสต็อก` }, { status: 400 });
      }
    }

    const rawTotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const discountAmount = discount || 0;
    const finalTotal = Math.max(0, rawTotal - discountAmount);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(finalTotal * 100),
      currency: "thb",
      metadata: {
        userId,
        rawTotal: rawTotal.toString(),
        discount: discountAmount.toString(),
        promoCode: promoCode || "",
        items: JSON.stringify(items.map((i: { productId: string; quantity: number; price: number }) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        }))),
        shipping: JSON.stringify({ firstName, lastName, email, phone, address, district, province, zipcode, note }),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch {
    return NextResponse.json({ message: "Failed to create payment intent" }, { status: 500 });
  }
}
