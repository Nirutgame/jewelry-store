import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  try {
    const productCats = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    const metas = await prisma.categoryMeta.findMany();

    const slugSet = new Set(productCats.map((c: { category: string }) => c.category));
    for (const meta of metas) slugSet.add(meta.slug);

    const result = await Promise.all(
      Array.from(slugSet).map(async (slug) => {
        const meta = metas.find((m) => m.slug === slug);
        const productCount = await prisma.product.count({ where: { category: slug } });
        return {
          id: slug,
          slug,
          name: meta?.nameTh || slug,
          nameEn: meta?.nameEn || meta?.nameTh || slug,
          description: meta?.description || "",
          descriptionEn: meta?.descriptionEn || meta?.description || "",
          image: meta?.image || "",
          sortOrder: meta?.sortOrder ?? 999,
          productCount,
        };
      })
    );

    result.sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;
  try {
    const { name, nameEn, slug, description, descriptionEn, image } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ message: "กรุณากรอกชื่อและ slug" }, { status: 400 });
    }

    const existingMeta = await prisma.categoryMeta.findUnique({ where: { slug } });
    if (existingMeta) {
      return NextResponse.json({ message: "Slug นี้มีอยู่แล้วในระบบ" }, { status: 400 });
    }

    await prisma.categoryMeta.upsert({
      where: { slug },
      update: { nameTh: name, nameEn: nameEn || "", description: description || "", descriptionEn: descriptionEn || "", image: image || "" },
      create: { slug, nameTh: name, nameEn: nameEn || "", description: description || "", descriptionEn: descriptionEn || "", image: image || "" },
    });

    return NextResponse.json({ id: slug, slug, name, nameEn: nameEn || "", description: description || "", descriptionEn: descriptionEn || "", image: image || "", productCount: 0 });
  } catch {
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
  }
}
