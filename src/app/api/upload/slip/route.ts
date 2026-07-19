import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { notifySlipUpload } from "@/lib/line-notify";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;

    if (!file || !orderId) {
      return NextResponse.json({ message: "Missing file or orderId" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "รองรับไฟล์ JPG, PNG และ WebP เท่านั้น" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "ไฟล์ต้องมีขนาดไม่เกิน 10MB" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "bank_transfer") {
      return NextResponse.json({ message: "This order does not use bank transfer" }, { status: 400 });
    }

    if (order.paymentStatus !== "pending") {
      return NextResponse.json({ message: "Order already paid or failed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const url = await uploadToCloudinary(buffer, "jewelry-store/slips");

    await prisma.order.update({
      where: { id: orderId },
      data: { slipImage: url },
    });

    await notifySlipUpload(orderId);

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ message: "Failed to upload slip" }, { status: 500 });
  }
}
