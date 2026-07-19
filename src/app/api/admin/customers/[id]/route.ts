import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { hash } from "bcryptjs";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;
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
  const guard = await requireAdmin();
  if (guard) return guard;

  const session = await getServerSession(authOptions);
  const requesterRole = (session?.user as { role?: string } | undefined)?.role;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) return NextResponse.json({ message: "Not found" }, { status: 404 });

    if (requesterRole === "admin" && targetUser.role !== "customer") {
      return NextResponse.json({ message: "ไม่สามารถแก้ไขผู้ใช้ระดับนี้ได้" }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, string> = {};

    if (body.role) {
      if (requesterRole === "admin" && body.role !== "customer") {
        return NextResponse.json({ message: "ไม่สามารถเปลี่ยนบทบาทได้" }, { status: 403 });
      }
      data.role = body.role;
    }

    if (body.password) data.password = await hash(body.password, 12);

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
