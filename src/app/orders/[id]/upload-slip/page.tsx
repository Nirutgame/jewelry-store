"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineCheck } from "react-icons/hi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

export default function UploadSlipPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const { addToast } = useToast();
  const { t } = useLanguage();

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
      }
    } catch {
      console.error("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file || !order) return;
    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orderId", order.id);

      const res = await fetch("/api/upload/slip", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage(t("orders.uploadSlip") + " " + t("checkout.orderSuccess"));
        addToast(t("orders.uploadSlip"), "success");
        setTimeout(() => router.push(`/orders/${order.id}`), 2000);
      } else {
        const err = await res.json();
        setMessage(err.message || t("checkout.total"));
        addToast(err.message || t("checkout.total"), "error");
      }
    } catch {
      setMessage(t("checkout.total"));
      addToast(t("checkout.total"), "error");
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("orders.noOrders")}</h2>
        <Link href="/orders" className="text-gold-600 dark:text-gold-400 hover:underline">{t("orders.title")}</Link>
      </div>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("checkout.orderSuccess")}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t("checkout.orderSuccess")}</p>
        <Link href={`/orders/${order.id}`} className="text-gold-600 dark:text-gold-400 hover:underline">{t("orders.orderId")}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/orders/${order.id}`} className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gold-700 dark:hover:text-gold-400 mb-6 transition-colors">
        <HiOutlineArrowLeft className="w-5 h-5 mr-1" />
        {t("orders.orderId")}
      </Link>

      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2">{t("orders.uploadSlip")}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t("orders.orderId")} #{order.id.slice(0, 8)} — {t("checkout.total")} {formatPrice(order.total)}</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium mb-1">{t("checkout.paymentMethod")}</p>
          <p>{t("checkout.bankTransfer")}</p>
          <p>{t("checkout.bankTransfer")}</p>
          <p>{t("checkout.bankTransfer")}</p>
          <p className="mt-2">{t("checkout.total")}: {formatPrice(order.total)}</p>
        </div>

        {preview ? (
          <div className="mb-4">
            <img src={preview} alt="สลิป" className="w-full rounded-lg border" />
          </div>
        ) : (
          <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-gold-400 transition-colors mb-4">
            <HiOutlinePhotograph className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t("orders.uploadSlip")}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}

        {preview && (
          <div className="flex gap-3">
            <button
              onClick={() => { setFile(null); setPreview(""); }}
              className="flex-1 btn-secondary text-center"
              disabled={uploading}
            >
              {t("common.edit")}
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 btn-primary text-center"
            >
              {uploading ? t("common.loading") : t("common.confirm")}
            </button>
          </div>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes("สำเร็จ") ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
