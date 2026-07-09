import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "admin") return false;
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promoCodes);
  } catch {
    return NextResponse.json({ message: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrder, maxUsage, expiresAt } = body;

    if (!code || !discountType || !discountValue || !expiresAt) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        maxUsage: maxUsage ? parseInt(maxUsage) : 100,
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create promo code" }, { status: 500 });
  }
}
