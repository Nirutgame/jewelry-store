import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipLimit = rateLimit(`reset-pw-otp-ip:${ip}`, 5, 300000);
    if (!ipLimit.success) {
      return NextResponse.json({ message: "โปรดลองอีกครั้งภายหลัง" }, { status: 429 });
    }

    const hashedOtp = createHash("sha256").update(otp).digest("hex");
    const token = await prisma.otpToken.findFirst({
      where: { email, otp: hashedOtp, used: false, expiresAt: { gte: new Date() } },
    });

    if (!token) {
      await prisma.otpLog.create({
        data: { email, action: "verify_failed", otp: hashedOtp, metadata: "{}" },
      });
      return NextResponse.json({ message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
    }

    await prisma.otpToken.update({
      where: { id: token.id },
      data: { used: true },
    });

    const hashedPassword = await hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.otpLog.create({
      data: { email, action: "reset_success", metadata: "{}" },
    });

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (e) {
    console.error("reset-password-by-otp error:", e);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
