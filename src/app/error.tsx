"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">
          {t("common.notFound")}
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {t("common.notFoundDesc")}
        </p>
        <button onClick={reset} className="btn-primary">
          {t("common.back")}
        </button>
      </div>
    </div>
  );
}
