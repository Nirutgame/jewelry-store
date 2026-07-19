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
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    const monthlyRevenue: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const order of orders) {
      const monthKey = new Date(order.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short" });
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.total;

      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;

      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.product.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      }
    }

    const monthlyData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));

    const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({ name, value }));

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const customerGrowth = users.reduce((acc: { month: string; count: number }[], user: { createdAt: Date }) => {
      const monthKey = new Date(user.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short" });
      const existing = acc.find((a) => a.month === monthKey);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ month: monthKey, count: 1 });
      }
      return acc;
    }, []);

    let cumulative = 0;
    const customerGrowthCumulative = customerGrowth.map((d: { month: string; count: number }) => {
      cumulative += d.count;
      return { month: d.month, count: cumulative };
    });

    return NextResponse.json({
      monthlyRevenue: monthlyData,
      statusBreakdown: statusData,
      topProducts,
      customerGrowth: customerGrowthCumulative,
    });
  } catch {
    return NextResponse.json({ message: "Failed to fetch analytics" }, { status: 500 });
  }
}
