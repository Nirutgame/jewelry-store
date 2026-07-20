import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await request.json();
    const { name, nameEn, description, descriptionEn, price, images, video, category, material, materialEn, stock, featured } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(description !== undefined && { description }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(images !== undefined && { images }),
        ...(video !== undefined && { video: video || null }),
        ...(category !== undefined && { category }),
        ...(material !== undefined && { material }),
        ...(materialEn !== undefined && { materialEn }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    await prisma.cartItem.deleteMany({ where: { productId: params.id } });
    await prisma.orderItem.deleteMany({ where: { productId: params.id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
