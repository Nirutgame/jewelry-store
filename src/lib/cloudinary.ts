import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "jewelry-store"
): Promise<string> {
  const subDir = folder === "jewelry-store/slips" ? "slips" : folder.replace("jewelry-store/", "");
  const ext = "jpg";
  const fileName = `slip-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", subDir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), fileBuffer);
  return `/api/uploads/${subDir}/${fileName}`;
}

export async function deleteFromCloudinary(_url: string): Promise<void> {
  // Local storage — no delete needed
}
