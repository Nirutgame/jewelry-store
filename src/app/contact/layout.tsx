import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ติดต่อ Lumière Jewelry เรายินดีให้คำปรึกษาและตอบทุกคำถามของคุณ",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
