"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<{ name: string; nameEn: string; slug: string }[]>([]);
  const pathname = usePathname();
  const { t, locale } = useLanguage();

  useEffect(() => {
    setIsAdmin(pathname?.startsWith("/admin") ?? false);
  }, [pathname]);

  useEffect(() => {
    if (isAdmin) return;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.filter((c: { slug: string }) => c.slug !== "all")))
      .catch(() => {});
  }, [isAdmin]);

  if (isAdmin) return null;
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-serif font-bold text-gold-500 mb-4">
              {t("common.appName")}
            </h3>
            <p className="text-gray-400 max-w-md">
              {t("about.intro")}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              {t("nav.categories")}
            </h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/products?category=${cat.slug}`} className="hover:text-gold-500 transition-colors">
                    {locale === "en" && cat.nameEn ? cat.nameEn : cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              {t("contact.title")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="hover:text-gold-500 transition-colors">
                  {t("about.title")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-500 transition-colors">
                  {t("contact.title")}
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-gold-500 transition-colors">
                  {t("nav.wishlist")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              {t("contact.title")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <HiOutlineLocationMarker className="w-5 h-5 text-gold-500" />
                <span>{t("contact.address")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlinePhone className="w-5 h-5 text-gold-500" />
                <span>{t("contact.phone")}</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlineMail className="w-5 h-5 text-gold-500" />
                <span>{t("contact.emailAddr")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t("common.appName")} {t("common.appTagline")}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
