import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`confirm-payment:${ip}`, 5, 60000);
  if (!success) {
    return NextResponse.json({ message: "โปรดลองอีกครั้งภายหลัง" }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ message: "Missing paymentIntentId" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (existingOrder) {
      return NextResponse.json(existingOrder);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ message: "Payment not succeeded" }, { status: 400 });
    }

    const { userId: metaUserId, items, shipping, rawTotal, discount, promoCode } = paymentIntent.metadata;

    if (!metaUserId || metaUserId !== userId || !items) {
      return NextResponse.json({ message: "Invalid payment metadata" }, { status: 400 });
    }

    const parsedItems = JSON.parse(items);
    const parsedShipping = JSON.parse(shipping);
    const discountAmount = parseFloat(discount || "0");
    const finalTotal = Math.max(0, parseFloat(rawTotal || "0") - discountAmount);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          total: finalTotal,
          promoCode: promoCode || null,
          promoDiscount: discountAmount > 0 ? discountAmount : 0,
          firstName: parsedShipping.firstName,
          lastName: parsedShipping.lastName,
          email: parsedShipping.email,
          phone: parsedShipping.phone,
          address: parsedShipping.address,
          district: parsedShipping.district,
          province: parsedShipping.province,
          zipcode: parsedShipping.zipcode,
          note: parsedShipping.note || null,
          paymentMethod: "card",
          paymentStatus: "paid",
          stripePaymentIntentId: paymentIntentId,
          paymentConfirmedAt: new Date(),
          status: "confirmed",
          items: {
            create: parsedItems.map((item: { productId: string; quantity: number; price: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      if (promoCode) {
        await tx.promoCode.update({
          where: { code: promoCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      for (const item of parsedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to confirm payment order" }, { status: 500 });
  }
}
