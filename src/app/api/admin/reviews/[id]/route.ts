import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
