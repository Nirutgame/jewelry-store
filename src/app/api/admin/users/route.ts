import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/guard";

const VALID_ROLES = ["customer", "admin", "superadmin"];

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ email: { contains: search } }, { name: { contains: search } }];
  if (roleFilter) where.role = roleFilter;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  try {
    const { name, email, password, role } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
    }

    const finalRole = role || "customer";
    if (!VALID_ROLES.includes(finalRole)) {
      return NextResponse.json({ message: "บทบาทไม่ถูกต้อง" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "อีเมลนี้มีผู้ใช้แล้ว" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name || "", email, password: hashedPassword, role: finalRole },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
  }
}
