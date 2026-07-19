"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrder: number;
  maxUsage: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrder: "",
    maxUsage: "100",
    expiresAt: "",
  });
  const { addToast } = useToast();
  const { t } = useLanguage();

  const fetchPromos = () => {
    setLoading(true);
    fetch("/api/admin/promocodes")
      .then((r) => r.json())
      .then(setPromos)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ code: "", discountType: "percentage", discountValue: "", minOrder: "", maxUsage: "100", expiresAt: "" });
        fetchPromos();
        addToast(t("admin.addPromocode"), "success");
      } else {
        addToast(t("checkout.total"), "error");
      }
    } catch {
      addToast(t("checkout.total"), "error");
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    await fetch(`/api/admin/promocodes/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !promo.isActive }),
    });
    fetchPromos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบรหัสส่วนลดนี้?")) return;
    await fetch(`/api/admin/promocodes/${id}`, { method: "DELETE" });
    fetchPromos();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">{t("admin.promocodes")}</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> {showCreate ? t("admin.cancel") : t("admin.addPromocode")}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t("admin.addPromocode")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("admin.promocodes")}</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" placeholder="WELCOME10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("admin.categories")}</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input-field">
                <option value="percentage">{t("checkout.total")}</option>
                <option value="fixed">{t("checkout.total")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("checkout.total")}</label>
              <input required type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("checkout.total")}</label>
              <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("admin.promocodes")}</label>
              <input type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("orders.date")}</label>
              <input required type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="input-field" />
            </div>
          </div>
          <button type="submit" className="btn-primary">{t("admin.addPromocode")}</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" /></div>
      ) : promos.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t("admin.noData")}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">{t("admin.promocodes")}</th>
                    <th className="px-4 py-3 font-medium">{t("checkout.discount")}</th>
                    <th className="px-4 py-3 font-medium">{t("checkout.total")}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.items")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.date")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.status")}</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800 dark:text-gray-100">{promo.code}</td>
                    <td className="px-4 py-3">
                      {promo.discountType === "percentage" ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                    </td>
                    <td className="px-4 py-3">{promo.minOrder > 0 ? formatPrice(promo.minOrder) : "-"}</td>
                    <td className="px-4 py-3">{promo.usedCount}/{promo.maxUsage}</td>
                    <td className="px-4 py-3">{new Date(promo.expiresAt).toLocaleDateString("th-TH")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(promo)} className={`px-2 py-1 rounded-full text-xs font-medium ${promo.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                        {promo.isActive ? t("review.show") : t("review.hide")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(promo.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
