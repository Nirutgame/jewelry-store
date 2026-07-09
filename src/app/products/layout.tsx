import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สินค้าทั้งหมด",
  description: "ค้นพบเครื่องประดับที่ใช่สำหรับคุณ จาก Lumière Jewelry",
  openGraph: {
    title: "สินค้าทั้งหมด | Lumière Jewelry",
    description: "ค้นพบเครื่องประดับที่ใช่สำหรับคุณ",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
