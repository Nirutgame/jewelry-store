"use client";

import { useTheme } from "@/context/ThemeContext";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors p-2"
      title={theme === "light" ? t("nav.themeDark") : t("nav.themeLight")}
    >
      {theme === "light" ? (
        <HiOutlineMoon className="w-5 h-5" />
      ) : (
        <HiOutlineSun className="w-5 h-5" />
      )}
    </button>
  );
}
