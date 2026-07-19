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
          description: meta?.description || "",
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
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, slug, description, image } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ message: "กรุณากรอกชื่อและ slug" }, { status: 400 });
    }

    const existingMeta = await prisma.categoryMeta.findUnique({ where: { slug } });
    if (existingMeta) {
      return NextResponse.json({ message: "Slug นี้มีอยู่แล้วในระบบ" }, { status: 400 });
    }

    await prisma.categoryMeta.upsert({
      where: { slug },
      update: { nameTh: name, description: description || "", image: image || "" },
      create: { slug, nameTh: name, description: description || "", image: image || "" },
    });

    return NextResponse.json({ id: slug, slug, name, description: description || "", image: image || "", productCount: 0 });
  } catch {
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
  }
}
