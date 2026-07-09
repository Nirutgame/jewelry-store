"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { OrderType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineCheck } from "react-icons/hi";
import { useToast } from "@/components/Toast";

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
        setMessage("อัปโหลดสลิปสำเร็จ! รอการยืนยันจากทางร้าน");
        addToast("อัปโหลดสลิปสำเร็จ", "success");
        setTimeout(() => router.push(`/orders/${order.id}`), 2000);
      } else {
        const err = await res.json();
        setMessage(err.message || "อัปโหลดไม่สำเร็จ");
        addToast(err.message || "อัปโหลดไม่สำเร็จ", "error");
      }
    } catch {
      setMessage("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
      addToast("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง", "error");
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">ไม่พบคำสั่งซื้อ</h2>
        <Link href="/orders" className="text-gold-600 hover:underline">กลับไปประวัติคำสั่งซื้อ</Link>
      </div>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineCheck className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">ชำระเงินแล้ว</h2>
        <p className="text-gray-500 mb-6">คำสั่งซื้อนี้ชำระเงินเรียบร้อยแล้ว</p>
        <Link href={`/orders/${order.id}`} className="text-gold-600 hover:underline">กลับไปรายละเอียดคำสั่งซื้อ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/orders/${order.id}`} className="inline-flex items-center text-gray-500 hover:text-gold-700 mb-6 transition-colors">
        <HiOutlineArrowLeft className="w-5 h-5 mr-1" />
        กลับไปรายละเอียดคำสั่งซื้อ
      </Link>

      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-2">อัปโหลดสลิปโอนเงิน</h1>
      <p className="text-gray-500 mb-8">คำสั่งซื้อ #{order.id.slice(0, 8)} — ยอด {formatPrice(order.total)}</p>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4 p-4 bg-amber-50 rounded-lg text-sm text-amber-800">
          <p className="font-medium mb-1">ข้อมูลการโอนเงิน</p>
          <p>ธนาคาร: ธนาคารกรุงเทพ</p>
          <p>ชื่อบัญชี: บริษัท ลูมิแยร์ จิวเวลรี่ จำกัด</p>
          <p>เลขที่บัญชี: 123-4-56789-0</p>
          <p className="mt-2">ยอดโอน: {formatPrice(order.total)}</p>
        </div>

        {preview ? (
          <div className="mb-4">
            <img src={preview} alt="สลิป" className="w-full rounded-lg border" />
          </div>
        ) : (
          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gold-400 transition-colors mb-4">
            <HiOutlinePhotograph className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">คลิกเพื่อเลือกไฟล์สลิป</p>
            <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG</p>
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
              เลือกใหม่
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 btn-primary text-center"
            >
              {uploading ? "กำลังอัปโหลด..." : "ยืนยันการอัปโหลด"}
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
