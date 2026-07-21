import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    // Anonymize orders — keep order records but remove personal info
    await prisma.order.updateMany({
      where: { userId },
      data: {
        firstName: "[Deleted]",
        lastName: "[Deleted]",
        email: "[Deleted]",
        phone: "[Deleted]",
        address: "[Deleted]",
        district: "[Deleted]",
        province: "[Deleted]",
        zipcode: "[Deleted]",
        note: null,
      },
    });

    // Delete cart items, wishlist, reviews
    await prisma.cartItem.deleteMany({ where: { userId } });
    await prisma.wishlistItem.deleteMany({ where: { userId } });
    await prisma.review.deleteMany({ where: { userId } });

    // Delete the user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "Account deleted" });
  } catch {
    return NextResponse.json({ message: "Failed to delete account" }, { status: 500 });
  }
}
