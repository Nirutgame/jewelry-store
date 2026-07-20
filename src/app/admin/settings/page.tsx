"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status, router]);

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("บันทึกสำเร็จ");
      } else {
        setMessage("บันทึกไม่สำเร็จ");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  const Field = ({ label, value, keyName, type = "text", rows }: { label: string; value: string; keyName: string; type?: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => set(keyName, e.target.value)} className="input-field" rows={rows} />
      ) : (
        <input type={type} value={value} onChange={(e) => set(keyName, e.target.value)} className="input-field" />
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
        ตั้งค่าร้านค้า
      </h1>

      {message && (
        <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${message === "บันทึกสำเร็จ" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">ภาษาไทย</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ชื่อร้าน" value={form.storeNameTh} keyName="storeNameTh" />
            <Field label="แท็กไลน์" value={form.taglineTh} keyName="taglineTh" />
            <Field label="ที่อยู่" value={form.addressTh} keyName="addressTh" />
            <Field label="เวลาทำการ" value={form.workingHoursTh} keyName="workingHoursTh" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">English</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Store Name" value={form.storeNameEn} keyName="storeNameEn" />
            <Field label="Tagline" value={form.taglineEn} keyName="taglineEn" />
            <Field label="Address" value={form.addressEn} keyName="addressEn" />
            <Field label="Working Hours" value={form.workingHoursEn} keyName="workingHoursEn" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">ติดต่อ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="เบอร์โทร" value={form.phone} keyName="phone" />
            <Field label="อีเมล" value={form.email} keyName="email" type="email" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">SEO</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title (TH)" value={form.seoTitleTh} keyName="seoTitleTh" />
            <Field label="Title (EN)" value={form.seoTitleEn} keyName="seoTitleEn" />
            <Field label="Description (TH)" value={form.seoDescTh} keyName="seoDescTh" rows={3} />
            <Field label="Description (EN)" value={form.seoDescEn} keyName="seoDescEn" rows={3} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
        </button>
      </form>
    </div>
  );
}
