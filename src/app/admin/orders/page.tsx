"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface AdminOrder {
  id: string;
  total: number;
  status: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  user: { name: string | null; email: string };
  items: { id: string }[];
}

const statuses = ["all", "pending", "confirmed", "shipping", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useLanguage();

  const fetchOrders = (page: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("page", page.toString());
    params.set("limit", "20");

    fetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res.status))
      .then((data) => {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      })
      .catch(() => { setOrders([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchOrders(page);
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
        {t("admin.manageOrders")}
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === s
                ? "bg-gold-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {s === "all" ? t("admin.allStatus") : t(`orders.${s}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          {t("orders.noOrders")}
        </div>
      ) : (
        <>
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">{t("orders.orderId")}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.customers")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.items")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.total")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.status")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-gold-600 dark:text-gold-400 hover:underline font-mono text-xs"
                        >
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {order.items.length} {t("products.pieces")}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "pending" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                          : order.status === "confirmed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                          : order.status === "shipping" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                          : order.status === "delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                          : order.status === "cancelled" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        }`}>
                          {t(`orders.${order.status}`) || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("th-TH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sm:hidden space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gold-600 dark:text-gold-400">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.status === "pending" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                    : order.status === "confirmed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    : order.status === "shipping" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                    : order.status === "delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    : order.status === "cancelled" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  }`}>
                    {t(`orders.${order.status}`) || order.status}
                  </span>
                </div>
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                  {order.firstName} {order.lastName}
                </p>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{order.items.length} {t("orders.items")}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatPrice(order.total)}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("th-TH")}
                </p>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                {t("products.previous")}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-gold-600 text-white"
                      : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                {t("products.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
