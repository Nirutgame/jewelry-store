import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const productCats = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    const metas = await prisma.categoryMeta.findMany({ orderBy: { sortOrder: "asc" } });

    const slugSet = new Set(productCats.map((c: { category: string }) => c.category));
    for (const meta of metas) slugSet.add(meta.slug);

    const result = Array.from(slugSet).map((slug) => {
      const meta = metas.find((m) => m.slug === slug);
      return {
        slug,
        name: meta?.nameTh || slug,
        description: meta?.description || "",
        image: meta?.image || "",
        sortOrder: meta?.sortOrder ?? 999,
      };
    });

    result.sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}
