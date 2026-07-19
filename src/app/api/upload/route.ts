import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

export async function POST(request: NextRequest) {
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
    }

    const urls: string[] = [];
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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
