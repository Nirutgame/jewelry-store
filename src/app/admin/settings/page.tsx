"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  HiOutlinePhotograph, HiOutlineX, HiOutlineSave, HiOutlineRefresh,
  HiOutlinePlus, HiOutlineTrash,
} from "react-icons/hi";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    storeNameTh: "", storeNameEn: "", taglineTh: "", taglineEn: "",
    phone: "", email: "", addressTh: "", addressEn: "",
    workingHoursTh: "", workingHoursEn: "",
    logoUrl: "", faviconUrl: "",
    seoTitleTh: "", seoTitleEn: "", seoDescTh: "", seoDescEn: "",
    bankName: "", bankAccount: "", bankHolder: "", bankPromptpay: "",
    facebookUrl: "", instagramUrl: "", lineUrl: "", tiktokUrl: "",
    aboutTh: "", aboutEn: "",
    heroSlides: "[]",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "superadmin") { router.push("/admin"); return; }
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setForm({
            storeNameTh: data.storeNameTh || "",
            storeNameEn: data.storeNameEn || "",
            taglineTh: data.taglineTh || "",
            taglineEn: data.taglineEn || "",
            phone: data.phone || "",
            email: data.email || "",
            addressTh: data.addressTh || "",
            addressEn: data.addressEn || "",
            workingHoursTh: data.workingHoursTh || "",
            workingHoursEn: data.workingHoursEn || "",
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
            seoTitleTh: data.seoTitleTh || "",
            seoTitleEn: data.seoTitleEn || "",
            seoDescTh: data.seoDescTh || "",
            seoDescEn: data.seoDescEn || "",
            bankName: data.bankName || "",
            bankAccount: data.bankAccount || "",
            bankHolder: data.bankHolder || "",
            bankPromptpay: data.bankPromptpay || "",
            facebookUrl: data.facebookUrl || "",
            instagramUrl: data.instagramUrl || "",
            lineUrl: data.lineUrl || "",
            tiktokUrl: data.tiktokUrl || "",
            aboutTh: data.aboutTh || "",
            aboutEn: data.aboutEn || "",
            heroSlides: data.heroSlides || "[]",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview("");
    setForm((prev) => ({ ...prev, logoUrl: "" }));
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleFaviconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const clearFavicon = () => {
    if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    setFaviconFile(null);
    setFaviconPreview("");
    setForm((prev) => ({ ...prev, faviconUrl: "" }));
    if (faviconInputRef.current) faviconInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    let logoUrl = form.logoUrl;
    if (logoFile) {
      const fd = new FormData();
      fd.append("file", logoFile);
      const uploadRes = await fetch("/api/upload/settings-logo", { method: "POST", body: fd });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        logoUrl = data.url;
      }
    }

    let faviconUrl = form.faviconUrl;
    if (faviconFile) {
      const fd = new FormData();
      fd.append("file", faviconFile);
      const uploadRes = await fetch("/api/upload/settings-favicon", { method: "POST", body: fd });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        faviconUrl = data.url;
      }
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logoUrl, faviconUrl }),
      });
      if (res.ok) {
        setMessage(locale === "en" ? "Settings saved!" : "บันทึกสำเร็จ");
      } else {
        setMessage(locale === "en" ? "Failed to save" : "บันทึกไม่สำเร็จ");
      }
    } catch {
      setMessage(locale === "en" ? "Error occurred" : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = async () => {
    if (!confirm(locale === "en" ? "Reset all to defaults?" : "คืนค่าเริ่มต้นทั้งหมด?")) return;
    setForm({
      storeNameTh: "Lumière", storeNameEn: "Lumière",
      taglineTh: "Jewelry", taglineEn: "Jewelry",
      phone: "02-123-4567", email: "contact@lumiere-jewelry.com",
      addressTh: "กรุงเทพฯ, ประเทศไทย", addressEn: "Bangkok, Thailand",
      workingHoursTh: "จันทร์ - ศุกร์ 09:00 - 18:00 น.", workingHoursEn: "Mon - Fri 09:00 - 18:00",
      logoUrl: "", faviconUrl: "",
      seoTitleTh: "Lumière Jewelry | ร้านจิวเวลรี่ชั้นนำ", seoTitleEn: "Lumière Jewelry",
      seoDescTh: "ร้านจิวเวลรี่ชั้นนำ ที่คัดสรรเครื่องประดับคุณภาพสูงจากวัสดุชั้นดี",
      seoDescEn: "Premium jewelry store curated with high-quality materials",
      bankName: "", bankAccount: "", bankHolder: "", bankPromptpay: "",
      facebookUrl: "", instagramUrl: "", lineUrl: "", tiktokUrl: "",
      aboutTh: "", aboutEn: "",
      heroSlides: JSON.stringify([
        { title: "Elegance Redefined", subtitle: "เครื่องประดับที่สะท้อนตัวตนของคุณ", image: "https://images.unsplash.com/photo-1515562141589-57e7e00d19e1?w=1600&q=80" },
        { title: "Timeless Beauty", subtitle: "ทุกชิ้นงานถูกสร้างด้วยความประณีต", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=1600&q=80" },
        { title: "Shine Bright", subtitle: "เพชรแท้คุณภาพสูง รับประกันความพึงพอใจ", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&q=80" },
      ]),
    });
    setLogoFile(null);
    setLogoPreview("");
    setFaviconFile(null);
    setFaviconPreview("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const Field = ({ label, value, keyName, type = "text", rows, placeholder }: { label: string; value: string; keyName: string; type?: string; rows?: number; placeholder?: string }) => (
    <div className={rows ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => set(keyName, e.target.value)} className="input-field" rows={rows} placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={(e) => set(keyName, e.target.value)} className="input-field" placeholder={placeholder} />
      )}
    </div>
  );

  const ImageUpload = ({ label, url, preview, file, onSelect, onClear, inputRef }: {
    label: string; url: string; preview: string; file: File | null;
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void; inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{label}</label>
      <div className="flex items-start gap-4">
        {(url || preview) && (
          <div className="relative inline-block group shrink-0">
            <img src={preview || url} alt={label} className="w-28 h-28 object-contain rounded-xl border dark:border-gray-700 bg-white" />
            <button type="button" onClick={onClear} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        )}
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gold-400 transition-colors min-w-[140px]">
          <HiOutlinePhotograph className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">คลิกเลือกรูป</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">JPG, PNG, WebP</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={onSelect} className="hidden" />
        </div>
      </div>
    </div>
  );

  const SocialField = ({ label, value, keyName, icon }: { label: string; value: string; keyName: string; icon: string }) => (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{icon} {label}</label>
      <input type="url" value={value} onChange={(e) => set(keyName, e.target.value)} className="input-field" placeholder="https://..." />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">
          {locale === "en" ? "Store Settings" : "ตั้งค่าร้านค้า"}
        </h1>
        <button type="button" onClick={resetForm} className="btn-secondary flex items-center gap-2 text-sm">
          <HiOutlineRefresh className="w-4 h-4" /> {locale === "en" ? "Reset" : "คืนค่าเริ่มต้น"}
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${message.includes("สำเร็จ") || message.includes("saved") ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
        {/* ร้านค้า / Store */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <Section title={locale === "en" ? "Store Info - Thai" : "ข้อมูลร้านค้า - ภาษาไทย"}>
            <Field label={locale === "en" ? "Store Name (TH)" : "ชื่อร้าน (TH)"} value={form.storeNameTh} keyName="storeNameTh" />
            <Field label={locale === "en" ? "Tagline (TH)" : "แท็กไลน์ (TH)"} value={form.taglineTh} keyName="taglineTh" />
            <Field label={locale === "en" ? "Address (TH)" : "ที่อยู่ (TH)"} value={form.addressTh} keyName="addressTh" />
            <Field label={locale === "en" ? "Working Hours (TH)" : "เวลาทำการ (TH)"} value={form.workingHoursTh} keyName="workingHoursTh" />
          </Section>

          <Section title={locale === "en" ? "Store Info - English" : "ข้อมูลร้านค้า - อังกฤษ"}>
            <Field label="Store Name (EN)" value={form.storeNameEn} keyName="storeNameEn" />
            <Field label="Tagline (EN)" value={form.taglineEn} keyName="taglineEn" />
            <Field label="Address (EN)" value={form.addressEn} keyName="addressEn" />
            <Field label="Working Hours (EN)" value={form.workingHoursEn} keyName="workingHoursEn" />
          </Section>
        </div>

        {/* ติดต่อ / Contact */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <Section title={locale === "en" ? "Contact" : "ข้อมูลติดต่อ"}>
            <Field label={locale === "en" ? "Phone" : "เบอร์โทร"} value={form.phone} keyName="phone" />
            <Field label="Email" value={form.email} keyName="email" type="email" />
          </Section>
        </div>

        {/* โลโก้ + Favicon */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
            {locale === "en" ? "Logo & Favicon" : "โลโก้และ Favicon"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUpload label={locale === "en" ? "Store Logo" : "โลโก้ร้าน"} url={form.logoUrl} preview={logoPreview} file={logoFile} onSelect={handleLogoSelect} onClear={clearLogo} inputRef={logoInputRef} />
            <ImageUpload label={locale === "en" ? "Favicon" : "Favicon (ไอคอนแท็บ)"} url={form.faviconUrl} preview={faviconPreview} file={faviconFile} onSelect={handleFaviconSelect} onClear={clearFavicon} inputRef={faviconInputRef} />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <Section title="SEO">
            <Field label="Title (TH)" value={form.seoTitleTh} keyName="seoTitleTh" />
            <Field label="Title (EN)" value={form.seoTitleEn} keyName="seoTitleEn" />
            <Field label="Description (TH)" value={form.seoDescTh} keyName="seoDescTh" rows={3} placeholder={locale === "en" ? "Meta description for search engines" : "คำอธิบายสำหรับ SEO"} />
            <Field label="Description (EN)" value={form.seoDescEn} keyName="seoDescEn" rows={3} />
          </Section>
        </div>

        {/* ข้อมูลการโอนเงิน */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
            {locale === "en" ? "Bank Transfer Info" : "ข้อมูลการโอนเงิน"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={locale === "en" ? "Bank Name" : "ชื่อธนาคาร"} value={form.bankName} keyName="bankName" placeholder={locale === "en" ? "e.g. Kasikorn Bank" : "เช่น ธ.กสิกรไทย"} />
            <Field label={locale === "en" ? "Account Number" : "เลขที่บัญชี"} value={form.bankAccount} keyName="bankAccount" />
            <Field label={locale === "en" ? "Account Holder" : "ชื่อบัญชี"} value={form.bankHolder} keyName="bankHolder" />
            <Field label={locale === "en" ? "PromptPay" : "พร้อมเพย์"} value={form.bankPromptpay} keyName="bankPromptpay" placeholder={locale === "en" ? "Phone or ID number" : "เบอร์โทร หรือ เลขบัตร"} />
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">Social Media</h2>
          <div className="grid grid-cols-1 gap-4">
            <SocialField label="Facebook" value={form.facebookUrl} keyName="facebookUrl" icon="📘" />
            <SocialField label="Instagram" value={form.instagramUrl} keyName="instagramUrl" icon="📷" />
            <SocialField label="LINE" value={form.lineUrl} keyName="lineUrl" icon="💬" />
            <SocialField label="TikTok" value={form.tiktokUrl} keyName="tiktokUrl" icon="🎵" />
          </div>
        </div>

        {/* Hero Slides */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
            {locale === "en" ? "Hero Slides" : "สไลด์หน้าแรก"}
          </h2>
          {(() => {
            let slides: { title: string; subtitle: string; image: string }[] = [];
            try { slides = JSON.parse(form.heroSlides || "[]"); } catch {}
            const setSlides = (s: typeof slides) => set("heroSlides", JSON.stringify(s));
            return (
              <div className="space-y-4">
                {slides.map((slide, idx) => (
                  <div key={idx} className="border dark:border-gray-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {slide.image && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <img src={slide.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Image</label>
                            <input type="text" value={slide.image} onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], image: e.target.value }; setSlides(s); }} className="input-field text-sm" placeholder="/uploads/hero/xxx.jpg" />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">&nbsp;</label>
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{locale === "en" ? "Upload" : "อัปโหลด"}</label>
                              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append("file", file);
                                const res = await fetch("/api/upload/hero-slide", { method: "POST", body: fd });
                                if (res.ok) { const data = await res.json(); const s = [...slides]; s[idx] = { ...s[idx], image: data.url }; setSlides(s); }
                              }} className="text-xs" />
                            </div>
                          </div>
                        </div>
                        <input type="text" value={slide.title} onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], title: e.target.value }; setSlides(s); }} className="input-field text-sm" placeholder={locale === "en" ? "Title" : "หัวข้อ"} />
                        <input type="text" value={slide.subtitle} onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], subtitle: e.target.value }; setSlides(s); }} className="input-field text-sm" placeholder={locale === "en" ? "Subtitle" : "คำอธิบาย"} />
                      </div>
                      <button type="button" onClick={() => { setSlides(slides.filter((_, i) => i !== idx)); }} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors shrink-0">
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setSlides([...slides, { title: "", subtitle: "", image: "" }])} className="btn-secondary flex items-center gap-2 text-sm">
                  <HiOutlinePlus className="w-4 h-4" /> {locale === "en" ? "Add Slide" : "เพิ่มสไลด์"}
                </button>
              </div>
            );
          })()}
        </div>

        {/* เกี่ยวกับเรา */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          <Section title={locale === "en" ? "About Page Content" : "เนื้อหาหน้าเกี่ยวกับเรา"}>
            <Field label={locale === "en" ? "Content (TH)" : "เนื้อหา (ภาษาไทย)"} value={form.aboutTh} keyName="aboutTh" rows={6} placeholder={locale === "en" ? "Write about your store..." : "เขียนเกี่ยวกับร้านของคุณ..."} />
            <Field label="Content (EN)" value={form.aboutEn} keyName="aboutEn" rows={6} placeholder="Write about your store..." />
          </Section>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <HiOutlineSave className="w-5 h-5" /> {saving ? (locale === "en" ? "Saving..." : "กำลังบันทึก...") : (locale === "en" ? "Save All Settings" : "บันทึกทั้งหมด")}
        </button>
      </form>
    </div>
  );
}
