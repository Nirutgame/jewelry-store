import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

const MAGIC_BYTES: Record<string, Uint8Array> = {
  "image/jpeg": new Uint8Array([0xFF, 0xD8, 0xFF]),
  "image/png": new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
  "image/webp": new Uint8Array([0x52, 0x49, 0x46, 0x46]),
};

function isValidImage(buffer: ArrayBuffer, mimeType: string): boolean {
  const magic = MAGIC_BYTES[mimeType];
  if (!magic) return false;
  const header = new Uint8Array(buffer, 0, magic.length);
  return magic.every((byte, i) => byte === header[i]);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "กรุณาเลือกไฟล์" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "รองรับไฟล์ JPG, PNG, WebP เท่านั้น" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "ไฟล์ต้องมีขนาดไม่เกิน 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    if (!isValidImage(bytes, file.type)) {
      return NextResponse.json({ message: "ไฟล์ไม่ใช่รูปภาพที่ถูกต้อง" }, { status: 400 });
    }

    const buffer = Buffer.from(bytes);
    const ext = file.type.split("/")[1] || "jpg";
    const fileName = `category-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "categories");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), buffer);

    const url = `/uploads/categories/${fileName}`;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ message: "อัปโหลดล้มเหลว" }, { status: 500 });
  }
}
