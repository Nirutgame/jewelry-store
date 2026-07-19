"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlineArrowLeft, HiOutlinePhotograph } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

const statusConfig: Record<string, { labelKey: string; color: string }> = {
  pending: { labelKey: "orders.pending", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" },
  confirmed: { labelKey: "orders.confirmed", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" },
  shipping: { labelKey: "orders.shipping", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200" },
  delivered: { labelKey: "orders.delivered", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" },
  cancelled: { labelKey: "orders.cancelled", color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" },
};

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: "checkout.bankTransfer",
  card: "checkout.creditCard",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "orders.pending",
  paid: "orders.confirmed",
  failed: "orders.cancelled",
};

export default function OrderDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchOrder();
    }
  }, [status, router]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setOrder(null);
      }
    } catch {
      console.error("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("orders.noOrders")}
        </h2>
        <Link href="/orders" className="text-gold-600 dark:text-gold-400 hover:underline">
        {t("orders.title")}
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/orders"
        className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gold-700 dark:hover:text-gold-400 mb-6 transition-colors"
      >
        <HiOutlineArrowLeft className="w-5 h-5 mr-1" />
        กลับไปประวัติคำสั่งซื้อ
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100">
            {t("orders.orderId")} #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-400 dark:text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {t(statusInfo.labelKey)}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.items")}
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={getImageUrl(item.product.images)}
                     alt={locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                      {locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.product.material} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t("checkout.subtotal")}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t("checkout.total")}</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gold-700 dark:text-gold-400 border-t pt-2">
                <span>{t("checkout.total")}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.shippingInfo")}
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 dark:text-gray-500">{t("checkout.firstName")}</p>
                <p className="text-gray-800 dark:text-gray-100">{order.firstName} {order.lastName}</p>
              </div>
              <div>
                <p className="text-gray-400 dark:text-gray-500">{t("checkout.email")}</p>
                <p className="text-gray-800 dark:text-gray-100">{order.email}</p>
              </div>
              <div>
                <p className="text-gray-400 dark:text-gray-500">{t("checkout.phone")}</p>
                <p className="text-gray-800 dark:text-gray-100">{order.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 dark:text-gray-500">{t("checkout.address")}</p>
                <p className="text-gray-800 dark:text-gray-100">
                  {order.address}<br />
                  {order.district} {order.province} {order.zipcode}
                </p>
              </div>
              {order.note && (
                <div>
                  <p className="text-gray-400 dark:text-gray-500">{t("checkout.note")}</p>
                  <p className="text-gray-800 dark:text-gray-100">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.paymentInfo")}
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 dark:text-gray-500">{t("checkout.paymentMethod")}</p>
                <p className="text-gray-800 dark:text-gray-100">{t(paymentMethodLabels[order.paymentMethod] || order.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-gray-400 dark:text-gray-500">{t("orders.status")}</p>
                <p className={`font-medium ${order.paymentStatus === "paid" ? "text-green-600 dark:text-green-400" : order.paymentStatus === "failed" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {t(paymentStatusLabels[order.paymentStatus] || order.paymentStatus)}
                </p>
              </div>
              {order.paymentStatus === "paid" && order.paymentConfirmedAt && (
                <div>
                  <p className="text-gray-400 dark:text-gray-500">{t("orders.date")}</p>
                  <p className="text-gray-800 dark:text-gray-100">
                    {new Date(order.paymentConfirmedAt).toLocaleDateString("th-TH", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              {order.paymentMethod === "bank_transfer" && order.paymentStatus === "pending" && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    {t("orders.paymentSlip")}
                  </p>
                  <Link
                    href={`/orders/${order.id}/upload-slip`}
                    className="inline-flex items-center gap-2 mt-3 text-sm text-gold-700 dark:text-gold-400 hover:text-gold-800 font-medium"
                  >
                    <HiOutlinePhotograph className="w-4 h-4" />
                    {t("orders.uploadSlip")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
