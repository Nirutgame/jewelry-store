import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.siteSetting.findFirst();
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "superadmin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const allowedFields = [
      "storeNameTh", "storeNameEn", "taglineTh", "taglineEn",
      "phone", "email", "addressTh", "addressEn",
      "workingHoursTh", "workingHoursEn",
      "logoUrl", "faviconUrl",
      "seoTitleTh", "seoTitleEn", "seoDescTh", "seoDescEn",
      "bankName", "bankAccount", "bankHolder", "bankPromptpay",
      "facebookUrl", "instagramUrl", "lineUrl", "tiktokUrl",
      "aboutTh", "aboutEn",
      "heroSlides",
    ];

    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key];
    }

    let settings = await prisma.siteSetting.findFirst();
    if (settings) {
      settings = await prisma.siteSetting.update({ where: { id: settings.id }, data });
    } else {
      settings = await prisma.siteSetting.create({ data });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
