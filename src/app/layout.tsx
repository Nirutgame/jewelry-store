import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSettings() {
  try {
    const settings = await prisma.siteSetting.findFirst();
    return settings || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const titleTh = settings?.seoTitleTh || "Lumière Jewelry | ร้านจิวเวลรี่ชั้นนำ";
  const titleEn = settings?.seoTitleEn || "Lumière Jewelry";
  const descTh = settings?.seoDescTh || "";
  const descEn = settings?.seoDescEn || "";

  return {
    title: {
      default: titleTh,
      template: `%s | ${titleEn}`,
    },
    description: descTh,
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    openGraph: {
      title: titleTh,
      description: descTh,
      type: "website",
      locale: "th_TH",
      siteName: settings?.storeNameEn || "Lumière Jewelry",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const logoUrl = settings?.logoUrl || "";

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
      <body className="main-body min-h-dvh flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200 scroll-buffer" data-logo-url={logoUrl}>
        <Providers>
          <Navbar ssrLogoUrl={logoUrl} />
          <main className="main-content flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
