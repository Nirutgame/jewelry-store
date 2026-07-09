import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json(
      { message: "อัปโหลดไฟล์ล้มเหลว" },
      { status: 500 }
    );
  }
}
