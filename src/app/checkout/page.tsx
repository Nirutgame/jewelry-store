"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartItemType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import StripePayment from "@/components/StripePayment";
import { useToast } from "@/components/Toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  zipcode: string;
  note: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{ id: string } | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    district: "",
    province: "",
    zipcode: "",
    note: "",
  });
  const { addToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
        const userEmail = session?.user?.email;
        if (userEmail) {
          setFormData((prev) => ({ ...prev, email: userEmail }));
        }
      }
    } catch {
      console.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildItems = () =>
    cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

  const handleBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPaymentError("");

    try {
      const items = buildItems();

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
          paymentMethod: "bank_transfer",
          promoCode: promoDiscount > 0 ? promoCode.trim() : null,
          promoDiscount: promoDiscount,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create order");
      }

      const order = await res.json();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPaymentError("");

    try {
      const items = buildItems();

      const body: Record<string, unknown> = { ...formData, items };
      if (promoDiscount > 0) {
        body.promoCode = promoCode.trim();
        body.discount = promoDiscount;
      }

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create payment");
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setSubmitting(false);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
      setSubmitting(false);
    }
  };

  const handleStripeSuccess = () => {
    addToast("ชำระเงินสำเร็จ!", "success");
    setOrderSuccess({ id: "" });
    setTimeout(() => router.push("/orders"), 1500);
  };

  const handleStripeError = (message: string) => {
    setPaymentError(message);
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const finalTotal = Math.max(0, cartTotal - promoDiscount);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), cartTotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setPromoDiscount(data.discount);
        setPromoMessage(`ใช้รหัสส่วนลดสำเร็จ ลด ${data.discountType === "percentage" ? `${data.discountValue}%` : `${formatPrice(data.discountValue)}`}`);
      } else {
        setPromoDiscount(0);
        setPromoMessage(data.message || "รหัสส่วนลดไม่ถูกต้อง");
      }
    } catch {
      setPromoMessage("เกิดข้อผิดพลาด");
    } finally {
      setPromoLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">
          ชำระเงินสำเร็จ!
        </h1>
        <p className="text-gray-500 mb-8">
          ขอบคุณสำหรับคำสั่งซื้อ เราจะจัดส่งสินค้าให้เร็วที่สุด
        </p>
        <Link href="/products" className="btn-primary inline-block">
          ชมสินค้าเพิ่มเติม
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
          ไม่มีสินค้าในตะกร้า
        </h2>
        <Link href="/products" className="text-gold-600 hover:underline">
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8">
        ชำระเงิน
      </h1>

      <form onSubmit={paymentMethod === "bank_transfer" ? handleBankTransfer : handleStripePayment}>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-serif font-semibold text-gray-800 mb-6">
                ข้อมูลการจัดส่ง
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="08X-XXX-XXXX"
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}|0[0-9]{9}"
                    title="เบอร์โทรศัพท์ 10 หลัก"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เขต/อำเภอ</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="XXXXX"
                    pattern="[0-9]{5}"
                    title="รหัสไปรษณีย์ 5 หลัก"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ (ไม่บังคับ)</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-serif font-semibold text-gray-800 mb-6">
                วิธีการชำระเงิน
              </h2>

              <div className="space-y-4">
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "bank_transfer" ? "border-gold-500 bg-gold-50" : "border-gray-200 hover:border-gold-300"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-gold-600 w-5 h-5"
                  />
                  <div>
                    <p className="font-medium text-gray-800">โอนเงินผ่านธนาคาร</p>
                    <p className="text-sm text-gray-500">ชำระผ่านการโอนเงิน อัปโหลดสลิปภายหลัง</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "card" ? "border-gold-500 bg-gold-50" : "border-gray-200 hover:border-gold-300"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-gold-600 w-5 h-5"
                  />
                  <div>
                    <p className="font-medium text-gray-800">บัตรเครดิต / เดบิต</p>
                    <p className="text-sm text-gray-500">ชำระด้วยบัตร Visa, Mastercard, JCB</p>
                  </div>
                </label>
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700 mb-2">ข้อมูลการโอนเงิน</p>
                  <p className="text-sm text-gray-600">ธนาคาร: ธนาคารกรุงเทพ</p>
                  <p className="text-sm text-gray-600">ชื่อบัญชี: บริษัท ลูมิแยร์ จิวเวลรี่ จำกัด</p>
                  <p className="text-sm text-gray-600">เลขที่บัญชี: 123-4-56789-0</p>
                </div>
              )}
            </div>

            {paymentMethod === "card" && clientSecret && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-6">
                  ข้อมูลบัตร
                </h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePayment
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                  />
                </Elements>
              </div>
            )}

            {paymentError && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm">
                {paymentError}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-serif font-semibold text-gray-800 mb-6">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
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
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="รหัสส่วนลด"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleValidatePromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {promoLoading ? "..." : "ใช้"}
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-sm mt-1 ${promoDiscount > 0 ? "text-green-600" : "text-rose-600"}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>ค่าสินค้า</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ส่วนลด</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  <span>ฟรี</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gold-700 border-t pt-2">
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {paymentMethod === "bank_transfer" && (
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-lg"
              >
                {submitting ? "กำลังดำเนินการ..." : "สั่งซื้อสินค้า"}
              </button>
            )}

            {paymentMethod === "card" && !clientSecret && (
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-lg"
              >
                {submitting ? "กำลังดำเนินการ..." : "ดำเนินการชำระเงิน"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
