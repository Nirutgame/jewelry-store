import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { code, discountType, discountValue, minOrder, maxUsage, expiresAt, isActive } = await request.json();
    const data: Record<string, unknown> = {};
    if (code !== undefined) data.code = code;
    if (discountType !== undefined) data.discountType = discountType;
    if (discountValue !== undefined) data.discountValue = discountValue;
    if (minOrder !== undefined) data.minOrder = minOrder;
    if (maxUsage !== undefined) data.maxUsage = maxUsage;
    if (expiresAt !== undefined) data.expiresAt = expiresAt;
    if (isActive !== undefined) data.isActive = isActive;

    const promo = await prisma.promoCode.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ message: "Failed to update promo code" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    await prisma.promoCode.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ message: "Failed to delete promo code" }, { status: 500 });
  }
}
