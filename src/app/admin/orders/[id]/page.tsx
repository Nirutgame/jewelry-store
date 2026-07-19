"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

const statuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];

interface AdminOrder extends OrderType {
  user: { id: string; name: string | null; email: string };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { addToast } = useToast();
  const { t, locale } = useLanguage();

  const fetchOrder = () => {
    setLoading(true);
    fetch(`/api/admin/orders/${params.id}`)
      .then((res) => res.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrder();
        addToast(t("admin.save"), "success");
      } else {
        addToast(t("checkout.total"), "error");
      }
    } catch {
      addToast(t("checkout.total"), "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("orders.noOrders")}
        </h2>
        <Link href="/admin/orders" className="text-gold-600 dark:text-gold-400 hover:underline">
          {t("orders.title")}
        </Link>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gold-700 dark:hover:text-gold-400 mb-6 text-sm"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        {t("admin.manageOrders")}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">
            {t("orders.orderId")} #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            order.status === "pending"
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
              : order.status === "confirmed"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
              : order.status === "shipping"
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
              : order.status === "delivered"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {t(`orders.${order.status}`)}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.items")}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({order.items.reduce((sum, item) => sum + item.quantity, 0)} {t("products.pieces")})
              </span>
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b dark:border-gray-700 last:border-0"
                >
                  <img
                    src={JSON.parse(item.product.images)[0] || "/placeholder.jpg"}
                     alt={locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {locale === "en" && item.product.materialEn ? item.product.materialEn : item.product.material}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">
                      x{item.quantity}
                    </p>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{t("cart.total")}</span>
              <span className="text-xl font-bold text-gold-700 dark:text-gold-400">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.status")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s, index) => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={updating || index <= currentStatusIndex}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    order.status === s
                      ? "bg-gold-600 text-white shadow-md"
                      : index < currentStatusIndex
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {t(`orders.${s}`)}
                </button>
              ))}
            </div>
            {updating && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t("common.loading")}</p>
            )}
          </div>

          {(order as { paymentMethod?: string }).paymentMethod === "bank_transfer" && (order as { paymentStatus?: string }).paymentStatus === "pending" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
                {t("checkout.title")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t("checkout.bankTransfer")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setUpdating(true);
                    await fetch(`/api/admin/orders/${params.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ paymentStatus: "paid", status: "confirmed" }),
                    });
                    setUpdating(false);
                    fetchOrder();
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {t("common.confirm")}
                </button>
                <button
                  onClick={async () => {
                    setUpdating(true);
                    await fetch(`/api/admin/orders/${params.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ paymentStatus: "failed" }),
                    });
                    setUpdating(false);
                    fetchOrder();
                  }}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-rose-600 dark:bg-rose-700 text-white rounded-lg font-medium hover:bg-rose-700 dark:hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {t("review.reject")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.customerInfo")}
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500 dark:text-gray-400">{t("customer.name")}: </span>
                <span className="font-medium">
                  {order.firstName} {order.lastName}
                </span>
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">{t("customer.email")}: </span>
                <span className="font-medium">{order.email}</span>
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">{t("checkout.phone")}: </span>
                <span className="font-medium">{order.phone}</span>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.shippingInfo")}
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                {order.firstName} {order.lastName}
              </p>
              <p>{order.address}</p>
              <p>
                {order.district} {order.province} {order.zipcode}
              </p>
              {order.note && (
                <p className="text-gray-500 dark:text-gray-400 mt-2">{t("checkout.note")}: {order.note}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("orders.paymentInfo")}
            </h2>
            <div className="space-y-2 text-sm">
              <p>                <span className="text-gray-500 dark:text-gray-400">{t("checkout.paymentMethod")}: </span><span className="font-medium">{t(`checkout.${(order as { paymentMethod?: string }).paymentMethod === "card" ? "creditCard" : "bankTransfer"}`)}</span></p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">{t("orders.status")}: </span>
                <span className={`font-medium ${(order as { paymentStatus?: string }).paymentStatus === "paid" ? "text-green-600 dark:text-green-400" : (order as { paymentStatus?: string }).paymentStatus === "failed" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {(order as { paymentStatus?: string }).paymentStatus === "paid" ? t("orders.confirmed") : (order as { paymentStatus?: string }).paymentStatus === "failed" ? t("orders.cancelled") : t("orders.pending")}
                </span>
              </p>
              {(order as { slipImage?: string }).slipImage && (
                <div className="mt-3">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{t("orders.paymentSlip")}:</p>
                  <a href={(order as { slipImage?: string }).slipImage || ""} target="_blank" rel="noopener noreferrer">
                    <img src={(order as { slipImage?: string }).slipImage || ""} alt={t("orders.uploadSlip")} className="w-48 rounded-lg border dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
