import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return { title: "ไม่พบสินค้า | Lumière Jewelry" };
    }

    const images = JSON.parse(product.images) as string[];

    return {
      title: `${product.name} | Lumière Jewelry`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: `${product.name} | Lumière Jewelry`,
        description: product.description.slice(0, 160),
        images: images.length > 0 ? [{ url: images[0] }] : [],
      },
    };
  } catch {
    return { title: "สินค้า | Lumière Jewelry" };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
