import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "กรุณาเลือกไฟล์" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return NextResponse.json({ message: "รองรับไฟล์ JPG, PNG, WebP เท่านั้น" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
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
