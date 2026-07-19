import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;
  try {
    const slug = params.id;
    const { name, nameEn, description, descriptionEn, image, sortOrder } = await request.json();
    const count = await prisma.product.count({ where: { category: slug } });

    await prisma.categoryMeta.upsert({
      where: { slug },
      update: { nameTh: name, nameEn: nameEn || "", description: description || "", descriptionEn: descriptionEn || "", image: image || "", sortOrder: sortOrder ?? 0 },
      create: { slug, nameTh: name, nameEn: nameEn || "", description: description || "", descriptionEn: descriptionEn || "", image: image || "", sortOrder: sortOrder ?? 0 },
    });

    return NextResponse.json({ slug, name, nameEn: nameEn || "", description, descriptionEn: descriptionEn || "", image, sortOrder, productCount: count });
  } catch {
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;
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
