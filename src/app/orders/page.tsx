"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlineClipboardList, HiOutlineChevronRight } from "react-icons/hi";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800" },
  shipping: { label: "กำลังจัดส่ง", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800" },
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

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
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">
        ประวัติคำสั่งซื้อ
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineClipboardList className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-serif font-semibold text-gray-600 mb-2">
            ไม่มีคำสั่งซื้อ
          </h2>
          <p className="text-gray-400 mb-6">
            คุณยังไม่มีคำสั่งซื้อในระบบ
          </p>
          <Link href="/products" className="btn-primary inline-block">
            ชมสินค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status] || statusConfig.pending;
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      คำสั่งซื้อ #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-400">
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
                      {statusInfo.label}
                    </span>
                    <HiOutlineChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item) => (
                      <img
                        key={item.id}
                        src={getImageUrl(item.product.images)}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      {order.items.map((i) => i.product.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold-700">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.items.length} ชิ้น
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
