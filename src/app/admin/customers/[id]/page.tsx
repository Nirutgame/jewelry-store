"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineKey } from "react-icons/hi";
import { formatPrice } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import { useLanguage } from "@/context/LanguageContext";

interface CustomerDetail {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  orders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    items: Array<{
      product: { id: string; name: string; images: string } | null;
    }>;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    product: { id: string; name: string; nameEn: string };
  }>;
  _count: { orders: number; reviews: number; wishlistItems: number };
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [resetting, setResetting] = useState(false);
  const { t, locale } = useLanguage();
  const { data: session } = useSession();
  const myRole = (session?.user as { role?: string } | undefined)?.role;
  const isSuperAdmin = myRole === "superadmin";

  const fetchCustomer = () => {
    fetch(`/api/admin/customers/${params.id}`)
      .then((res) => {
        if (res.status === 404) {
          router.push("/admin/customers");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setCustomer(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const handleRoleChange = async (newRole: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/customers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setCustomer((prev) => prev ? { ...prev, role: newRole } : null);
      }
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetMessage({ type: "error", text: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน" });
      return;
    }
    setResetting(true);
    setResetMessage(null);
    try {
      const res = await fetch(`/api/admin/customers/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setResetMessage({ type: "success", text: "เปลี่ยนรหัสผ่านสำเร็จ" });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setResetMessage({ type: "error", text: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
      }
    } catch {
      setResetMessage({ type: "error", text: "เกิดข้อผิดพลาด" });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div>
      <Link
        href="/admin/customers"
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gold-700 dark:hover:text-gold-400 mb-6 text-sm"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        {t("admin.manageCustomers")}
      </Link>

      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
        {customer.name || t("customer.name")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("orders.customerInfo")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("customer.name")}</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">{customer.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("customer.email")}</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("customer.role")}</p>
              {isSuperAdmin ? (
                <select
                  value={customer.role}
                  disabled={updating}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="input-field mt-1"
                >
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              ) : (
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  customer.role === "superadmin"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                    : customer.role === "admin"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}>
                  {customer.role}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("customer.registeredDate")}</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {new Date(customer.createdAt).toLocaleDateString("th-TH")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("admin.totalOrders")}</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">{t("customer.totalOrders")}</span>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{customer._count.orders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">{t("customer.totalReviews")}</span>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{customer._count.reviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">{t("customer.wishlistItems")}</span>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{customer._count.wishlistItems}</span>
            </div>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <HiOutlineKey className="w-5 h-5" /> รีเซ็ตรหัสผ่าน
          </h2>
          <form onSubmit={handleResetPassword} className="max-w-sm space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="ยืนยันรหัสผ่าน"
                required
              />
            </div>
            {resetMessage && (
              <p className={`text-sm ${resetMessage.type === "success" ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}`}>
                {resetMessage.text}
              </p>
            )}
            <button type="submit" disabled={resetting} className="btn-primary text-sm">
              {resetting ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("customer.orderHistory")} ({customer.orders.length})
        </h2>
        {customer.orders.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">{t("customer.noOrders")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">{t("orders.orderId")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.items")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.total")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.status")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.date")}</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-gold-600 dark:text-gold-400 hover:underline font-mono text-xs">
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {order.items.map((item) => item.product?.name).filter(Boolean).join(", ") || `${order.items.length} ${t("products.pieces")}`}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{formatPrice(order.total)}</td>
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
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("customer.reviews")} ({customer.reviews.length})
        </h2>
        {customer.reviews.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">{t("customer.noReviews")}</p>
        ) : (
          <div className="space-y-4">
            {customer.reviews.map((review) => (
              <div key={review.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <Link href={`/products/${review.product.id}`} className="font-medium text-gray-800 dark:text-gray-100 hover:text-gold-700 dark:hover:text-gold-400">
                    {locale === "en" && review.product.nameEn ? review.product.nameEn : review.product.name}
                  </Link>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("th-TH")}
                  </span>
                </div>
                <div className="mt-1">
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
