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
