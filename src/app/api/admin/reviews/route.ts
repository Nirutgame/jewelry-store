import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;
  const productId = searchParams.get("productId");

  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, images: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);
    return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;
  try {
    const body = await request.json();
    const review = await prisma.review.update({
      where: { id: body.id },
      data: { isVisible: body.isVisible },
    });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
