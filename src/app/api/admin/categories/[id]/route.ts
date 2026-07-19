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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const slug = params.id;
    const { name, description, image, sortOrder } = await request.json();
    const count = await prisma.product.count({ where: { category: slug } });

    await prisma.categoryMeta.upsert({
      where: { slug },
      update: { nameTh: name, description: description || "", image: image || "", sortOrder: sortOrder ?? 0 },
      create: { slug, nameTh: name, description: description || "", image: image || "", sortOrder: sortOrder ?? 0 },
    });

    return NextResponse.json({ slug, name, description, image, sortOrder, productCount: count });
  } catch {
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const slug = params.id;
    const count = await prisma.product.count({ where: { category: slug } });
    if (count > 0) {
      return NextResponse.json(
        { message: `ไม่สามารถลบหมวดหมู่ที่มีสินค้า ${count} ชิ้นได้` },
        { status: 400 }
      );
    }
    await prisma.categoryMeta.delete({ where: { slug } }).catch(() => {});
    return NextResponse.json({ message: "ลบหมวดหมู่เรียบร้อย" });
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
