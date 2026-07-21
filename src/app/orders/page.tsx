"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlineClipboardList, HiOutlineChevronRight } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

const statusConfig: Record<string, { labelKey: string; color: string }> = {
  pending: { labelKey: "orders.pending", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" },
  confirmed: { labelKey: "orders.confirmed", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" },
  shipping: { labelKey: "orders.shipping", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200" },
  delivered: { labelKey: "orders.delivered", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" },
  cancelled: { labelKey: "orders.cancelled", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" },
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8">
        {t("orders.title")}
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineClipboardList className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
          <h2 className="text-xl font-serif font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {t("orders.noOrders")}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 mb-6">
            {t("orders.noOrders")}
          </p>
          <Link href="/products" className="btn-primary inline-block">
            {t("home.shopNow")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status] || statusConfig.pending;
            const statusLabel = t(statusInfo.labelKey);
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("orders.orderId")} #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusLabel}
                    </span>
                    <HiOutlineChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={item.id}
                        src={getImageUrl(item.product.images)}
                        alt={locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {order.items.map((i) => locale === "en" && i.product.nameEn ? i.product.nameEn : i.product.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold-700 dark:text-gold-400">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {order.items.length} {t("products.pieces")}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {locale === "en" ? "Account" : "บัญชีของฉัน"}
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/user/data" className="text-sm text-gold-700 dark:text-gold-400 hover:underline">
            📥 {locale === "en" ? "Export My Data" : "ส่งออกข้อมูลของฉัน"}
          </Link>
          <Link href="/user/delete" className="text-sm text-rose-600 dark:text-rose-400 hover:underline">
            🗑 {locale === "en" ? "Delete Account" : "ลบบัญชี"}
          </Link>
        </div>
      </div>
    </div>
  );
}
