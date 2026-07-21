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
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cartItems);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch cart" },
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
  const body = await request.json().catch(() => ({}));
  const { productId, quantity } = body;

  if (!productId) {
    return NextResponse.json({ message: "Missing productId" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "ไม่พบสินค้า" },
        { status: 404 }
      );
    }

    if (product.stock < 1) {
      return NextResponse.json(
        { message: "สินค้าหมด ไม่สามารถเพิ่มในตะกร้าได้" },
        { status: 400 }
      );
    }

    const qty = quantity || 1;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    const totalQty = existing ? existing.quantity + qty : qty;

    if (totalQty > product.stock) {
      return NextResponse.json(
        { message: `สินค้ามีเพียง ${product.stock} ชิ้นในสต็อก` },
        { status: 400 }
      );
    }

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: totalQty },
        include: { product: true },
      });
      return NextResponse.json(updated);
    }

    const cartItem = await prisma.cartItem.create({
      data: { userId, productId, quantity: qty },
      include: { product: true },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (e) {
    console.error("Cart POST error:", e);
    return NextResponse.json(
      { message: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id, quantity } = await request.json();

  try {
    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  let id: string | null = null;
  try { const body = await request.json(); id = body?.id || null; } catch { /* clear cart */ }

  try {
    if (id) {
      const cartItem = await prisma.cartItem.findUnique({ where: { id } });
      if (!cartItem || cartItem.userId !== userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      await prisma.cartItem.delete({ where: { id } });
      return NextResponse.json({ message: "Item removed" });
    } else {
      await prisma.cartItem.deleteMany({ where: { userId } });
      return NextResponse.json({ message: "Cart cleared" });
    }
  } catch {
    return NextResponse.json(
      { message: "Failed to remove item" },
      { status: 500 }
    );
  }
}
