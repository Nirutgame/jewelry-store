import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "admin") return false;
  return true;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { items: { include: { product: { select: { id: true, name: true, images: true } } } } },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { product: { select: { id: true, name: true } } },
        },
        _count: { select: { orders: true, reviews: true, wishlistItems: true } },
      },
    });
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: body.role },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
