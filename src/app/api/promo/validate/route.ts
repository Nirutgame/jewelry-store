import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code || !cartTotal) {
      return NextResponse.json({ message: "Missing code or cart total" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return NextResponse.json({ message: "ไม่พบรหัสส่วนลดนี้" }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ message: "รหัสส่วนลดนี้ถูกปิดใช้งานแล้ว" }, { status: 400 });
    }

    if (promo.expiresAt < new Date()) {
      return NextResponse.json({ message: "รหัสส่วนลดหมดอายุแล้ว" }, { status: 400 });
    }

    if (promo.usedCount >= promo.maxUsage) {
      return NextResponse.json({ message: "รหัสส่วนลดถูกใช้จนครบจำนวนแล้ว" }, { status: 400 });
    }

    if (cartTotal < promo.minOrder) {
      return NextResponse.json({ message: `ยอดสั่งซื้อขั้นต่ำ ${promo.minOrder.toLocaleString()} บาท` }, { status: 400 });
    }

    let discount = 0;
    if (promo.discountType === "percentage") {
      discount = cartTotal * (promo.discountValue / 100);
    } else {
      discount = promo.discountValue;
    }

    if (discount > cartTotal) {
      discount = cartTotal;
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discount,
      total: cartTotal - discount,
    });
  } catch {
    return NextResponse.json({ message: "Failed to validate promo code" }, { status: 500 });
  }
}
