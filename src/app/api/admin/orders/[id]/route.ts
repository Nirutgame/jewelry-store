import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { sendOrderStatusEmail } from "@/lib/email";
import { notifyOrderStatusChange } from "@/lib/line-notify";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true },
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
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const body = await request.json();
    const { status, paymentStatus } = body;

    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: { status: true, email: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const oldStatus = currentOrder.status;
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "paid") {
        updateData.paymentConfirmedAt = new Date();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (status && status !== oldStatus) {
      sendOrderStatusEmail(currentOrder.email, order.id, status).catch(() => {});
      notifyOrderStatusChange(order.id, oldStatus, status).catch(() => {});
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { message: "Failed to update order" },
      { status: 500 }
    );
  }
}