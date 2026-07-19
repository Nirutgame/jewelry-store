import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/guard";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true, reviews: true } } },
  });

  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  try {
    const body = await request.json();
    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id;

    if (body.role && body.role !== targetUser.role) {
      if (sessionUserId === params.id && targetUser.role === "superadmin" && body.role !== "superadmin") {
        const superadminCount = await prisma.user.count({ where: { role: "superadmin" } });
        if (superadminCount <= 1) {
          return NextResponse.json({ message: "ไม่สามารถลดสิทธิ์ superadmin คนสุดท้ายได้" }, { status: 400 });
        }
      }
    }

    const data: Record<string, string> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.role) data.role = body.role;
    if (body.password) data.password = await hash(body.password, 12);

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("PATCH user error:", e);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const superadminCount = await prisma.user.count({ where: { role: "superadmin" } });
    if (user.role === "superadmin" && superadminCount <= 1) {
      return NextResponse.json({ message: "ไม่สามารถลบ superadmin คนสุดท้ายได้" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
