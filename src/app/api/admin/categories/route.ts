import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "admin") {
    return false;
  }
  return true;
}

const categoryLabels: Record<string, string> = {
  rings: "แหวน",
  necklaces: "สร้อยคอ",
  earrings: "ต่างหู",
  bracelets: "กำไล",
  watches: "นาฬิกา",
};

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const result = categories.map((c) => ({
      id: c.category,
      name: categoryLabels[c.category] || c.category,
      slug: c.category,
      productCount: 0,
    }));

    for (const cat of result) {
      cat.productCount = await prisma.product.count({
        where: { category: cat.slug },
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { message: "กรุณากรอกชื่อและ slug" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findFirst({
      where: { category: slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Slug นี้มีอยู่แล้วในระบบ" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      id: slug,
      name,
      slug,
      productCount: 0,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}
