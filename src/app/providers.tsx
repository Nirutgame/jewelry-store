"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
