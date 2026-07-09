import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Lumière Jewelry | ร้านจิวเวลรี่ชั้นนำ",
    template: "%s | Lumière Jewelry",
  },
  description:
    "ร้านจิวเวลรี่ชั้นนำ ที่คัดสรรเครื่องประดับคุณภาพสูงจากวัสดุชั้นดี เพื่อให้คุณเปล่งประกายในทุกโอกาส",
  openGraph: {
    title: "Lumière Jewelry | ร้านจิวเวลรี่ชั้นนำ",
    description:
      "ร้านจิวเวลรี่ชั้นนำ ที่คัดสรรเครื่องประดับคุณภาพสูงจากวัสดุชั้นดี เพื่อให้คุณเปล่งประกายในทุกโอกาส",
    type: "website",
    locale: "th_TH",
    siteName: "Lumière Jewelry",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
