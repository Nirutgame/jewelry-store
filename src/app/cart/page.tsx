"use client";

import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useCart, CartItemData } from "@/context/CartContext";
import { HiOutlineMinus, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { getImageUrl } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount, loading } = useCart();
  const { t, locale } = useLanguage();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8">
        {t("cart.title")} ({itemCount})
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineShoppingBag className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
          <h2 className="text-xl font-serif font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {t("cart.empty")}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 mb-6">
            {t("cart.emptyDesc")}
          </p>
          <Link href="/products" className="btn-primary inline-block">
            {t("cart.browseProducts")}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} onUpdate={updateQuantity} onRemove={removeItem} locale={locale} />
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-600 dark:text-gray-300">{t("cart.total")}</span>
              <span className="text-3xl font-bold text-gold-700 dark:text-gold-400">
                {formatPrice(total)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="btn-primary w-full text-center block text-lg"
            >
              {t("cart.checkout")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function CartItemRow({ item, onUpdate, onRemove, locale }: {
  item: CartItemData;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  locale: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl shadow-sm p-4 flex items-center gap-4">
      <img
        src={item.image}
        alt={locale === "en" && item.nameEn ? item.nameEn : item.name}
        className="w-20 h-20 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
          {locale === "en" && item.nameEn ? item.nameEn : item.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate(item.productId, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="p-1.5 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
        >
          <HiOutlineMinus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdate(item.productId, item.quantity + 1)}
          className="p-1.5 rounded-lg border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <HiOutlinePlus className="w-4 h-4" />
        </button>
      </div>
      <p className="font-semibold text-gray-800 dark:text-gray-100 w-20 text-right">
        {formatPrice(item.price * item.quantity)}
      </p>
      <button
        onClick={() => onRemove(item.productId)}
        className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
      >
        <HiOutlineTrash className="w-5 h-5" />
      </button>
    </div>
  );
}
