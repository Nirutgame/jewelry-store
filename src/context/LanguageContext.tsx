"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import th from "../../public/locales/th.json";
import en from "../../public/locales/en.json";

type Locale = "th" | "en";
type Translations = Record<string, Record<string, string>>;

const translations: Record<Locale, Translations> = { th, en };

interface LanguageContextType {
  locale: Locale;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("th");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "th" || saved === "en")) {
      setLocale(saved);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split(".");
    let result: unknown = translations[locale];
    for (const k of keys) {
      if (result && typeof result === "object" && k in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof result === "string" ? result : key;
  }, [locale]);

  const toggleLanguage = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "th" ? "en" : "th";
      localStorage.setItem("locale", next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
