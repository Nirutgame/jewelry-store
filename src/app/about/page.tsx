"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setContent(locale === "en" ? data.aboutEn : data.aboutTh);
        }
      })
      .catch(() => {});
  }, [locale]);

  const hasCustomContent = content && content.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
          {t("about.title")}
        </h1>

        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12 bg-gray-100 dark:bg-gray-700">
          <img
            src="https://images.unsplash.com/photo-1589674781759-c21a91d6d2e3?w=1200&q=80"
            alt="Lumière Jewelry Workshop"
            className="w-full h-full object-cover"
          />
        </div>

        {hasCustomContent ? (
          <div className="prose prose-gray max-w-none">
            {content?.split("\n").map((line, i) => (
              <p key={i} className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              <strong className="text-gold-700 dark:text-gold-400">{t("common.appName")}</strong> {t("about.intro")}
            </p>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {t("about.origin")}
            </p>

            <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mt-12 mb-6">
              {t("about.philosophy")}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {t("about.philosophyDesc")}
            </p>

            <div className="grid sm:grid-cols-3 gap-8 my-12">
              <div className="text-center">
                <div className="text-4xl font-serif font-bold text-gold-700 dark:text-gold-400 mb-2">
                  {t("about.quality")}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("about.qualityDesc")}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-serif font-bold text-gold-700 dark:text-gold-400 mb-2">
                  {t("about.design")}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("about.designDesc")}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-serif font-bold text-gold-700 dark:text-gold-400 mb-2">
                  {t("about.service")}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("about.serviceDesc")}
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {t("about.intro")}
            </p>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("about.philosophyDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
