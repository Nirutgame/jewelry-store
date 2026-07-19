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
    const body = await request.json();
    const promo = await prisma.promoCode.update({
      where: { id: params.id },
      data: body,
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
