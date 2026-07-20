import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const MAX_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "กรุณาเลือกไฟล์วิดีโอ" }, { status: 400 });
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "รองรับไฟล์ MP4, WebM และ OGG เท่านั้น" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "ไฟล์วิดีโอต้องมีขนาดไม่เกิน 50MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const extMap: Record<string, string> = { "mp4": "mp4", "webm": "webm", "ogg": "ogv", "ogv": "ogv" };
    const finalExt = extMap[ext] || "mp4";

    const dir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(dir, { recursive: true });

    const fileName = `product-video-${Date.now()}-${randomUUID().slice(0, 8)}.${finalExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(dir, fileName), buffer);

    const url = `/uploads/videos/${fileName}`;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ message: "อัปโหลดวิดีโอล้มเหลว" }, { status: 500 });
  }
}
