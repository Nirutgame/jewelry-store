import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (email) {
      const ip = getClientIp(request);
      const ipLimit = rateLimit(`otp-verify-ip:${ip}`, 10, 300000);
      if (!ipLimit.success) {
        return NextResponse.json({ message: "โปรดลองอีกครั้งภายหลัง" }, { status: 429 });
      }
      const emailLimit = rateLimit(`otp-verify:${email}`, 5, 300000);
      if (!emailLimit.success) {
        return NextResponse.json({ message: "ลองผิดพลาดหลายครั้ง โปรดลองใหม่ใน 5 นาที" }, { status: 429 });
      }
    }

    if (!email || !otp) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    const token = await prisma.otpToken.findFirst({
      where: { email, otp, used: false, expiresAt: { gte: new Date() } },
    });

    if (!token) {
      return NextResponse.json({ message: "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
    }

    await prisma.otpToken.update({
      where: { id: token.id },
      data: { used: true },
    });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: email.split("@")[0], password: "", role: "customer" },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch {
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
