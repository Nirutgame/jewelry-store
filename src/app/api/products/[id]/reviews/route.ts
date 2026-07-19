import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { containsProfanity, maskProfanity } from "@/lib/profanity";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: params.id, isVisible: true },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgResult = await prisma.review.aggregate({
      where: { productId: params.id, isVisible: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      avgRating: avgResult._avg.rating || 0,
      totalReviews: avgResult._count.rating,
    });
  } catch {
    return NextResponse.json({ message: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { rating, comment } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1-5" }, { status: 400 });
    }

    let cleanComment = comment || null;
    let autoHidden = false;
    if (cleanComment && containsProfanity(cleanComment)) {
      cleanComment = maskProfanity(cleanComment);
      autoHidden = true;
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId: params.id } },
    });

    if (existing) {
      const review = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating,
          comment: cleanComment,
          isVisible: autoHidden ? false : existing.isVisible,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });
      return NextResponse.json(review);
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: params.id,
        rating,
        comment: cleanComment,
        isVisible: !autoHidden,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create review" }, { status: 500 });
  }
}
