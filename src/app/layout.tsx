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
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                const mq = window.matchMedia('(prefers-color-scheme: dark)');
                if (t === 'dark' || (!t && mq.matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
