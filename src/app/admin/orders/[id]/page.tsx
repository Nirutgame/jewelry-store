"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { useToast } from "@/components/Toast";

const statuses = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  shipping: "กำลังจัดส่ง",
  delivered: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: "โอนเงินผ่านธนาคาร",
  card: "บัตรเครดิต / เดบิต",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  paid: "ชำระแล้ว",
  failed: "ชำระไม่สำเร็จ",
};

interface AdminOrder extends OrderType {
  user: { id: string; name: string | null; email: string };
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { addToast } = useToast();

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
        addToast("อัปเดตสถานะสำเร็จ", "success");
      } else {
        addToast("เกิดข้อผิดพลาด", "error");
      }
    } catch {
      addToast("เกิดข้อผิดพลาด", "error");
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
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
          ไม่พบออเดอร์
        </h2>
        <Link href="/admin/orders" className="text-gold-600 hover:underline">
          กลับไปรายการออเดอร์
        </Link>
      </div>
    );
  }

  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="flex items-center gap-1 text-gray-500 hover:text-gold-700 mb-6 text-sm"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        กลับไปออเดอร์ทั้งหมด
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">
            ออเดอร์ #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
              ? "bg-yellow-100 text-yellow-800"
              : order.status === "confirmed"
              ? "bg-blue-100 text-blue-800"
              : order.status === "shipping"
              ? "bg-purple-100 text-purple-800"
              : order.status === "delivered"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
              สินค้าในออเดอร์
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b last:border-0"
                >
                  <img
                    src={JSON.parse(item.product.images)[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.product.material}
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
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">รวมทั้งหมด</span>
              <span className="text-xl font-bold text-gold-700">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
              อัปเดตสถานะ
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
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-600 hover:bg-gold-50 hover:text-gold-700 border border-gray-200"
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
            {updating && (
              <p className="text-sm text-gray-500 mt-2">กำลังอัปเดต...</p>
            )}
          </div>

          {(order as { paymentMethod?: string }).paymentMethod === "bank_transfer" && (order as { paymentStatus?: string }).paymentStatus === "pending" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
                ยืนยันการชำระเงิน
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                ลูกค้าเลือกชำระผ่านการโอนเงิน กรุณาตรวจสอบสลิปและยืนยันเมื่อได้รับเงินแล้ว
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ยืนยันการชำระเงิน
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
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  ปฏิเสธการชำระเงิน
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
              ข้อมูลลูกค้า
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">ชื่อ: </span>
                <span className="font-medium">
                  {order.firstName} {order.lastName}
                </span>
              </p>
              <p>
                <span className="text-gray-500">อีเมล: </span>
                <span className="font-medium">{order.email}</span>
              </p>
              <p>
                <span className="text-gray-500">โทรศัพท์: </span>
                <span className="font-medium">{order.phone}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
              ที่อยู่จัดส่ง
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
                <p className="text-gray-500 mt-2">หมายเหตุ: {order.note}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
              การชำระเงิน
            </h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">วิธีชำระเงิน: </span><span className="font-medium">{paymentMethodLabels[(order as { paymentMethod?: string }).paymentMethod || ""] || (order as { paymentMethod?: string }).paymentMethod || "โอนเงินผ่านธนาคาร"}</span></p>
              <p>
                <span className="text-gray-500">สถานะ: </span>
                <span className={`font-medium ${(order as { paymentStatus?: string }).paymentStatus === "paid" ? "text-green-600" : (order as { paymentStatus?: string }).paymentStatus === "failed" ? "text-red-600" : "text-amber-600"}`}>
                  {paymentStatusLabels[(order as { paymentStatus?: string }).paymentStatus || ""] || (order as { paymentStatus?: string }).paymentStatus || "รอดำเนินการ"}
                </span>
              </p>
              {(order as { slipImage?: string }).slipImage && (
                <div className="mt-3">
                  <p className="text-gray-500 mb-2">สลิปการโอนเงิน:</p>
                  <a href={(order as { slipImage?: string }).slipImage || ""} target="_blank" rel="noopener noreferrer">
                    <img src={(order as { slipImage?: string }).slipImage || ""} alt="สลิปโอนเงิน" className="w-48 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity" />
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
