import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 6;

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
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "กรุณาเลือกไฟล์" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ message: "อัปโหลดได้สูงสุด 10 รูป" }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ message: "รองรับไฟล์ JPG, PNG และ WebP เท่านั้น" }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ message: "แต่ละไฟล์ต้องมีขนาดไม่เกิน 10MB" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      if (!isValidImage(bytes, file.type)) {
        return NextResponse.json({ message: "ไฟล์ไม่ใช่รูปภาพที่ถูกต้อง" }, { status: 400 });
      }
    }

    const urls: string[] = [];
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `product-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(dir, fileName), buffer);
      urls.push(`/uploads/products/${fileName}`);
    }

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ message: "อัปโหลดไฟล์ล้มเหลว" }, { status: 500 });
  }
}
