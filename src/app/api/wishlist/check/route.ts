import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ inWishlist: false });
  }

  const userId = (session.user as { id: string }).id;
  const productId = request.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ inWishlist: false });
  }

  try {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    return NextResponse.json({ inWishlist: !!item });
  } catch {
    return NextResponse.json({ inWishlist: false });
  }
}
