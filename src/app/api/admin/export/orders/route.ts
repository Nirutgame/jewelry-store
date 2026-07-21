import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(startDate && endDate ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } : {}),
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    const csv = [
      "Order ID,Date,Customer,Email,Phone,Total,Status,Payment,Items",
      ...orders.map((o) =>
        [
          o.id.slice(0, 8),
          o.createdAt.toISOString(),
          `"${o.firstName} ${o.lastName}"`,
          o.email,
          o.phone,
          o.total,
          o.status,
          o.paymentMethod,
          o.items.reduce((s, i) => s + i.quantity, 0),
        ].join(",")
      ),
    ].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=orders-export-${new Date().toISOString().slice(0, 10)}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ message: "Export failed" }, { status: 500 });
  }
}
