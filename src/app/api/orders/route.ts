import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { notifyNewOrder } from "@/lib/line-notify";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await request.json();
    const { items, firstName, lastName, email, phone, address, district, province, zipcode, note, paymentMethod, promoCode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (phone && !/^0[0-9]{9}$/.test(phone)) {
      return NextResponse.json({ message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" }, { status: 400 });
    }

    if (zipcode && !/^[0-9]{5}$/.test(zipcode)) {
      return NextResponse.json({ message: "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" }, { status: 400 });
    }

    let rawTotal = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { message: `ไม่พบสินค้า` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `สินค้า "${product.name}" มีเพียง ${product.stock} ชิ้นในสต็อก` },
          { status: 400 }
        );
      }

      rawTotal += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
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

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          total: finalTotal,
          promoCode: promoCode || null,
          promoDiscount: discountAmount > 0 ? discountAmount : 0,
          firstName,
          lastName,
          email,
          phone,
          address,
          district,
          province,
          zipcode,
          note: note || null,
          paymentMethod: paymentMethod || "bank_transfer",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (promoCode && discountAmount > 0) {
        await tx.promoCode.update({
          where: { code: promoCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    sendOrderConfirmationEmail(email, {
      id: order.id,
      firstName,
      lastName,
      total: order.total,
      items: order.items,
    }).catch(() => {});

    notifyNewOrder({
      id: order.id,
      firstName,
      lastName,
      total: order.total,
      paymentMethod: order.paymentMethod,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    }).catch(() => {});

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
