"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import StripePayment from "@/components/StripePayment";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripeKey && !stripeKey.includes("placeholder") ? loadStripe(stripeKey) : null;

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
  const { items: cartItems, loading: cartLoading, total: cartTotal } = useCart();
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
  const { t, locale } = useLanguage();

  const settingsFetched = useRef(false);
  const emailSet = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && !cartLoading) {
      setLoading(false);
      if (!emailSet.current && session?.user?.email) {
        emailSet.current = true;
        setFormData((prev) => ({ ...prev, email: session.user.email }));
      }
    }
  }, [status, router, cartLoading, session]);

  useEffect(() => {
    if (status === "authenticated" && !cartLoading && !settingsFetched.current) {
      settingsFetched.current = true;
      fetch("/api/settings")
        .then((r) => r.json())
        .then((data) => {
          if (data && data.id) {
            setFormData((prev) => ({
              ...prev,
              phone: prev.phone || data.phone || "",
              address: prev.address || data.address || "",
              district: prev.district || "",
              province: prev.province || "",
              zipcode: prev.zipcode || "",
            }));
          }
        })
        .catch(() => {});
    }
  }, [status, cartLoading]);

  const buildItems = () =>
    cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
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
      setPaymentError(err instanceof Error ? err.message : t("checkout.total"));
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
      setPaymentError(err instanceof Error ? err.message : t("checkout.total"));
      setSubmitting(false);
    }
  };

  const handleStripeSuccess = () => {
    addToast(t("checkout.orderSuccess"), "success");
    setOrderSuccess({ id: "" });
    setTimeout(() => router.push("/orders"), 1500);
  };

  const handleStripeError = (message: string) => {
    setPaymentError(message);
  };

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
        setPromoMessage(t("checkout.promoCode") + " " + t("checkout.apply") + ` ${data.discountType === "percentage" ? `${data.discountValue}%` : `${formatPrice(data.discountValue)}`}`);
      } else {
        setPromoDiscount(0);
        setPromoMessage(data.message || t("checkout.total"));
      }
    } catch {
      setPromoMessage(t("checkout.total"));
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
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("checkout.orderSuccess")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {t("checkout.orderSuccessDesc")}
        </p>
        <Link href="/products" className="btn-primary inline-block">
          {t("home.shopNow")}
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("cart.empty")}
        </h2>
        <Link href="/products" className="text-gold-600 dark:text-gold-400 hover:underline">
          {t("cart.browseProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8">
        {t("checkout.title")}
      </h1>

      <form onSubmit={paymentMethod === "bank_transfer" ? handleBankTransfer : handleStripePayment}>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-6">
                {t("checkout.shippingInfo")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.firstName")}</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.lastName")}</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.email")}</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.phone")}</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.address")}</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.district")}</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.province")}</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.zipcode")}</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t("checkout.note")}</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-6">
                {t("checkout.paymentMethod")}
              </h2>

              <div className="space-y-4">
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "bank_transfer" ? "border-gold-500 bg-gold-50" : "border-gray-200 dark:border-gray-700 hover:border-gold-300"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-gold-600 w-5 h-5"
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{t("checkout.bankTransfer")}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("checkout.total")}</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "card" ? "border-gold-500 bg-gold-50" : "border-gray-200 dark:border-gray-700 hover:border-gold-300"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-gold-600 w-5 h-5"
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{t("checkout.creditCard")}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("checkout.total")}</p>
                  </div>
                </label>
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">ข้อมูลการโอนเงิน</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("checkout.total")}: {t("checkout.total")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("checkout.total")}: {t("checkout.total")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("checkout.total")}: {t("checkout.total")}</p>
                </div>
              )}
            </div>

            {paymentMethod === "card" && clientSecret && stripePromise && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  {t("checkout.total")}
                </h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePayment
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                  />
                </Elements>
              </div>
            )}
            {paymentMethod === "card" && !stripePromise && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                กรุณาตั้งค่า Stripe API key เพื่อใช้ชำระด้วยบัตร
              </div>
            )}

            {paymentError && (
              <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 p-4 rounded-lg text-sm">
                {paymentError}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-serif font-semibold text-gray-800 dark:text-gray-100 mb-6">
                {t("checkout.orderSummary")}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} {t("products.pieces")})
                </span>
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={locale === "en" && item.nameEn ? item.nameEn : item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                        {locale === "en" && item.nameEn ? item.nameEn : item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {formatPrice(item.price * item.quantity)}
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
                    placeholder={t("checkout.promoCode")}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleValidatePromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
                  >
                    {promoLoading ? "..." : t("checkout.apply")}
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-sm mt-1 ${promoDiscount > 0 ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t("checkout.subtotal")}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{t("checkout.discount")}</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t("checkout.total")}</span>
                  <span>{t("checkout.total")}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gold-700 dark:text-gold-400 border-t pt-2">
                  <span>{t("checkout.total")}</span>
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
                {submitting ? t("common.loading") : t("checkout.placeOrder")}
              </button>
            )}

            {paymentMethod === "card" && !clientSecret && (
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-lg"
              >
                {submitting ? t("common.loading") : t("checkout.title")}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
