"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";

export default function DeleteAccountPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const handleDelete = async () => {
    if (confirm !== (locale === "en" ? "DELETE" : "ลบ")) {
      setError(locale === "en" ? 'Type "DELETE" to confirm' : 'พิมพ์ "ลบ" เพื่อยืนยัน');
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        await signOut({ redirect: false });
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete account");
      }
    } catch {
      setError(locale === "en" ? "Error occurred" : "เกิดข้อผิดพลาด");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
        {locale === "en" ? "Delete Account" : "ลบบัญชีผู้ใช้"}
      </h1>

      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-6 mb-6">
        <p className="text-rose-700 dark:text-rose-300 font-medium mb-2">
          ⚠️ {locale === "en" ? "Warning" : "คำเตือน"}
        </p>
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {locale === "en"
            ? "This action cannot be undone. All your personal data will be permanently deleted. Order records will be anonymized for accounting purposes."
            : "การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลส่วนบุคคลทั้งหมดของคุณจะถูกลบอย่างถาวร ข้อมูลคำสั่งซื้อจะถูกทำให้ไม่สามารถระบุตัวตนได้เพื่อวัตถุประสงค์ทางบัญชี"}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {locale === "en"
            ? `Type "DELETE" to confirm`
            : 'พิมพ์ "ลบ" เพื่อยืนยัน'}
        </p>

        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input-field"
          placeholder={locale === "en" ? 'Type "DELETE"' : 'พิมพ์ "ลบ"'}
        />

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {deleting
              ? (locale === "en" ? "Deleting..." : "กำลังลบ...")
              : (locale === "en" ? "Delete My Account" : "ลบบัญชีของฉัน")}
          </button>
          <Link href="/" className="btn-secondary">
            {t("admin.cancel")}
          </Link>
        </div>
      </div>
    </div>
  );
}
