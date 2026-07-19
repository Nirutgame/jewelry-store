"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-serif font-bold text-gold-600 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
          {t("common.notFound")}
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {t("common.notFoundDesc")}
        </p>
        <Link href="/" className="btn-primary">
          {t("common.backToHome")}
        </Link>
      </div>
    </div>
  );
}
