import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (email) {
      const ip = getClientIp(request);
      const ipLimit = rateLimit(`forgot-pw-ip:${ip}`, 3, 60000);
      if (!ipLimit.success) {
        return NextResponse.json({ message: "โปรดลองอีกครั้งภายหลัง" }, { status: 429 });
      }
      const emailLimit = rateLimit(`forgot-pw:${email}`, 1, 120000);
      if (!emailLimit.success) {
        return NextResponse.json({ message: "สามารถขอรีเซ็ตรหัสผ่านได้อีกครั้งใน 2 นาที" }, { status: 429 });
      }
    }

    if (!email) {
      return NextResponse.json(
        { message: "กรุณาระบุอีเมล" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว (หากอีเมลนี้มีการลงทะเบียน)" },
        { status: 200 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr);
    }

    return NextResponse.json(
      { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" },
      { status: 200 }
    );
  } catch (e) {
    console.error("forgot-password error:", e);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
