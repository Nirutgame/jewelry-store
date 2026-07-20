import { NextResponse } from "next/server";
import { randomInt, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email, locale } = await request.json();

    if (email) {
      const ip = getClientIp(request);
      const ipLimit = rateLimit(`otp-send-ip:${ip}`, 5, 60000);
      if (!ipLimit.success) {
        return NextResponse.json({ message: "โปรดลองอีกครั้งภายหลัง" }, { status: 429 });
      }
      const emailLimit = rateLimit(`otp-send:${email}`, 1, 60000);
      if (!emailLimit.success) {
        return NextResponse.json({ message: "สามารถขอ OTP ได้อีกครั้งใน 1 นาที" }, { status: 429 });
      }
    }

    if (!email) {
      return NextResponse.json({ message: "กรุณาระบุอีเมล" }, { status: 400 });
    }

    await prisma.otpToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    await prisma.otpToken.create({
      data: { email, otp: hashedOtp, expiresAt },
    });

    await prisma.otpLog.create({
      data: { email, action: "send", otp: hashedOtp },
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
