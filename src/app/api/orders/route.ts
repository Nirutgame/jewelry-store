import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { items, firstName, lastName, email, phone, address, district, province, zipcode, note, paymentMethod, promoCode, promoDiscount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

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
    }

    const rawTotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const discountAmount = promoDiscount || 0;
    const finalTotal = Math.max(0, rawTotal - discountAmount);

    const order = await prisma.$transaction(async (tx) => {
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
            create: items.map(
              (item: { productId: string; quantity: number; price: number }) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })
            ),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (promoCode) {
        await tx.promoCode.update({
          where: { code: promoCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      for (const item of items) {
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
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
