import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, locale } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "กรุณาระบุอีเมล" }, { status: 400 });
    }

    await prisma.otpToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpToken.create({
      data: { email, otp, expiresAt },
    });

    await prisma.otpLog.create({
      data: { email, action: "send", otp },
    });

    try {
      await sendOtpEmail(email, otp, locale || "th");
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
    }

    return NextResponse.json({ message: "ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว" });
  } catch (e) {
    console.error("send-otp error:", e);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
