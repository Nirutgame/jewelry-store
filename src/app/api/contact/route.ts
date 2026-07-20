import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`contact:${ip}`, 2, 60000);
  if (!success) {
    return NextResponse.json({ message: "โปรดลองอีกครั้งภายหลัง" }, { status: 429 });
  }

  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
    }

    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return NextResponse.json({ message: "ข้อความมีความยาวเกินกำหนด" }, { status: 400 });
    }

    return NextResponse.json({ message: "ส่งข้อความสำเร็จ" }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
