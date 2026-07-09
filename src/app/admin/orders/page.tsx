"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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
const statusLabels: Record<string, string> = {
  all: "ทั้งหมด",
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  shipping: "กำลังจัดส่ง",
  delivered: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const url = statusFilter === "all"
      ? "/api/admin/orders"
      : `/api/admin/orders?status=${statusFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">
        จัดการออเดอร์
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === s
                ? "bg-gold-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gold-50 hover:text-gold-700 border border-gray-200"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          ยังไม่มีออเดอร์
        </div>
      ) : (
        <>
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">ออเดอร์</th>
                    <th className="px-4 py-3 font-medium">ลูกค้า</th>
                    <th className="px-4 py-3 font-medium">สินค้า</th>
                    <th className="px-4 py-3 font-medium">ยอดรวม</th>
                    <th className="px-4 py-3 font-medium">สถานะ</th>
                    <th className="px-4 py-3 font-medium">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-gold-600 hover:underline font-mono text-xs"
                        >
                          #{order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {order.items.length} ชิ้น
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "shipping"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
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
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-gold-600">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "shipping"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <p className="font-medium text-gray-800 text-sm">
                  {order.firstName} {order.lastName}
                </p>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <span>{order.items.length} สินค้า</span>
                  <span className="font-semibold text-gray-800">{formatPrice(order.total)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("th-TH")}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
