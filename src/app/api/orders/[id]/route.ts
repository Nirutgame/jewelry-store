import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const order = await prisma.order.findFirst({
      where: { id: params.id, userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { status: newStatus } = await request.json();

  try {
    const order = await prisma.order.findFirst({
      where: { id: params.id, userId },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Users can only cancel pending orders
    if (newStatus === "cancelled") {
      if (order.status !== "pending") {
        return NextResponse.json({ message: "Cannot cancel order in current status" }, { status: 400 });
      }
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: { status: "cancelled" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  } catch {
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}
