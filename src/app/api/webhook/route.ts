import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, items, shipping, rawTotal, discount, promoCode } = paymentIntent.metadata;

    if (!userId || !items) {
      return NextResponse.json({ message: "Missing metadata" }, { status: 400 });
    }

    const parsedItems = JSON.parse(items);
    const parsedShipping = JSON.parse(shipping);
    const discountAmount = parseFloat(discount || "0");
    const finalTotal = Math.max(0, parseFloat(rawTotal || "0") - discountAmount);

    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.order.create({
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
            stripePaymentIntentId: paymentIntent.id,
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
      });
    } catch {
      return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
