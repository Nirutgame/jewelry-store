import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (category && category !== "all") {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const enriched = products.map((p) => {
      const ratings = p.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return {
        id: p.id, name: p.name, nameEn: p.nameEn, description: p.description, descriptionEn: p.descriptionEn, price: p.price,
        images: p.images, video: p.video, category: p.category, material: p.material, materialEn: p.materialEn,
        stock: p.stock, featured: p.featured, createdAt: p.createdAt,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: p._count.reviews,
      };
    });

    return NextResponse.json({ products: enriched, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await request.json();
    const { name, nameEn, description, descriptionEn, price, images, video, category, material, materialEn, stock, featured } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        nameEn: nameEn || "",
        description,
        descriptionEn: descriptionEn || "",
        price: parseFloat(price),
        images: images || JSON.stringify([]),
        video: video || null,
        category,
        material: material || "",
        materialEn: materialEn || "",
        stock: parseInt(stock) || 0,
        featured: featured || false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
