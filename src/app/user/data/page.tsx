"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function UserDataPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [orders, setOrders] = useState<{ id: string; total: number; status: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth/login"); return; }
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : data.orders || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleExport = () => {
    setExporting(true);
    const rows = [["Order ID", "Date", "Total", "Status"].join(",")];
    orders.forEach((o) => {
      rows.push([o.id.slice(0, 8), new Date(o.createdAt).toISOString(), o.total, o.status].join(","));
    });
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-data-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8">
        {locale === "en" ? "My Data" : "ข้อมูลของฉัน"}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-3">
            {locale === "en" ? "Download My Data" : "ดาวน์โหลดข้อมูลของฉัน"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {locale === "en"
              ? "You can download your order history as a CSV file."
              : "คุณสามารถดาวน์โหลดประวัติคำสั่งซื้อของคุณในรูปแบบ CSV"}
          </p>
          <button onClick={handleExport} disabled={exporting || orders.length === 0} className="btn-primary">
            {exporting ? (locale === "en" ? "Exporting..." : "กำลังส่งออก...") : (locale === "en" ? "📥 Export Orders" : "📥 ส่งออกคำสั่งซื้อ")}
          </button>
          {orders.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">{locale === "en" ? "No orders to export" : "ไม่มีคำสั่งซื้อ"}</p>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-gold-600 dark:text-gold-400 hover:underline text-sm">
          {t("common.backToHome")}
        </Link>
      </div>
    </div>
  );
}
