"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlineArrowLeft, HiOutlinePhotograph } from "react-icons/hi";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-blue-100 text-blue-800" },
  shipping: { label: "กำลังจัดส่ง", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-800" },
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

export default function OrderDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);

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
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
          ไม่พบคำสั่งซื้อ
        </h2>
        <Link href="/orders" className="text-gold-600 hover:underline">
          กลับไปประวัติคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/orders"
        className="inline-flex items-center text-gray-500 hover:text-gold-700 mb-6 transition-colors"
      >
        <HiOutlineArrowLeft className="w-5 h-5 mr-1" />
        กลับไปประวัติคำสั่งซื้อ
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">
            คำสั่งซื้อ #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-400 mt-1">
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
          {statusInfo.label}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
              รายการสินค้า
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={getImageUrl(item.product.images)}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.product.material} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>ค่าสินค้า</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gold-700 border-t pt-2">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
              ข้อมูลการจัดส่ง
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">ชื่อผู้รับ</p>
                <p className="text-gray-800">{order.firstName} {order.lastName}</p>
              </div>
              <div>
                <p className="text-gray-400">อีเมล</p>
                <p className="text-gray-800">{order.email}</p>
              </div>
              <div>
                <p className="text-gray-400">เบอร์โทรศัพท์</p>
                <p className="text-gray-800">{order.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">ที่อยู่</p>
                <p className="text-gray-800">
                  {order.address}<br />
                  {order.district} {order.province} {order.zipcode}
                </p>
              </div>
              {order.note && (
                <div>
                  <p className="text-gray-400">หมายเหตุ</p>
                  <p className="text-gray-800">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
              ข้อมูลการชำระเงิน
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">วิธีการชำระเงิน</p>
                <p className="text-gray-800">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-400">สถานะการชำระเงิน</p>
                <p className={`font-medium ${order.paymentStatus === "paid" ? "text-green-600" : order.paymentStatus === "failed" ? "text-red-600" : "text-amber-600"}`}>
                  {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                </p>
              </div>
              {order.paymentStatus === "paid" && order.paymentConfirmedAt && (
                <div>
                  <p className="text-gray-400">วันที่ชำระเงิน</p>
                  <p className="text-gray-800">
                    {new Date(order.paymentConfirmedAt).toLocaleDateString("th-TH", {
                      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              {order.paymentMethod === "bank_transfer" && order.paymentStatus === "pending" && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    กรุณาโอนเงินตามจำนวนที่แสดงด้านบน และอัปโหลดสลิปเพื่อยืนยันการชำระเงิน
                  </p>
                  <Link
                    href={`/orders/${order.id}/upload-slip`}
                    className="inline-flex items-center gap-2 mt-3 text-sm text-gold-700 hover:text-gold-800 font-medium"
                  >
                    <HiOutlinePhotograph className="w-4 h-4" />
                    อัปโหลดสลิป
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
