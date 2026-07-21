"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SiteSettings {
  storeNameTh: string;
  storeNameEn: string;
  taglineTh: string;
  taglineEn: string;
  phone: string;
  email: string;
  addressTh: string;
  addressEn: string;
  workingHoursTh: string;
  workingHoursEn: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  seoTitleTh: string;
  seoTitleEn: string;
  seoDescTh: string;
  seoDescEn: string;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
  bankPromptpay: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  lineUrl: string | null;
  tiktokUrl: string | null;
  aboutTh: string | null;
  aboutEn: string | null;
}

const defaultSettings: SiteSettings = {
  storeNameTh: "Lumière",
  storeNameEn: "Lumière",
  taglineTh: "Jewelry",
  taglineEn: "Jewelry",
  phone: "02-123-4567",
  email: "contact@lumiere-jewelry.com",
  addressTh: "กรุงเทพฯ, ประเทศไทย",
  addressEn: "Bangkok, Thailand",
  workingHoursTh: "จันทร์ - ศุกร์ 09:00 - 18:00 น.",
  workingHoursEn: "Mon - Fri 09:00 - 18:00",
  logoUrl: null,
  faviconUrl: null,
  seoTitleTh: "Lumière Jewelry | ร้านจิวเวลรี่ชั้นนำ",
  seoTitleEn: "Lumière Jewelry",
  seoDescTh: "ร้านจิวเวลรี่ชั้นนำ ที่คัดสรรเครื่องประดับคุณภาพสูงจากวัสดุชั้นดี",
  seoDescEn: "Premium jewelry store curated with high-quality materials",
  bankName: null,
  bankAccount: null,
  bankHolder: null,
  bankPromptpay: null,
  facebookUrl: null,
  instagramUrl: null,
  lineUrl: null,
  tiktokUrl: null,
  aboutTh: null,
  aboutEn: null,
};

const SettingsContext = createContext<SiteSettings>(defaultSettings);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setSettings(data);
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
