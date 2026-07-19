"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WishlistItemType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlineHeart, HiOutlineTrash, HiOutlineShoppingBag } from "react-icons/hi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

export default function WishlistPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { t, locale } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then(setItems)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      }
    } catch {
      console.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        addToast(t("products.addToCart") + " " + t("cart.title"), "success");
      }
    } catch {
      addToast(t("checkout.total"), "error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t("wishlist.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("wishlist.title")} {items.length > 0 && `(${items.length} ${t("products.items")})`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineHeart className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t("wishlist.empty")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t("wishlist.emptyDesc")}
          </p>
          <Link href="/products" className="btn-primary">
            {t("wishlist.browseProducts")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="card overflow-hidden group"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Link href={`/products/${item.product.id}`}>
                  <img
                    src={getImageUrl(item.product.images)}
                     alt={locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  title={t("wishlist.remove")}
                >
                  <HiOutlineTrash className="w-4 h-4 text-rose-500" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-1">
                  {item.product.category}
                </p>
                <Link href={`/products/${item.product.id}`}>
                  <h3 className="font-serif font-bold text-gray-800 dark:text-gray-100 mb-2 hover:text-gold-700 dark:hover:text-gold-400 transition-colors line-clamp-1">
                    {locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
                  </h3>
                </Link>
                <p className="text-lg font-bold text-gold-700 dark:text-gold-400 mb-3">
                  {formatPrice(item.product.price)}
                </p>
                <button
                  onClick={() => handleAddToCart(item.productId)}
                  className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <HiOutlineShoppingBag className="w-4 h-4" />
                  {t("wishlist.addToCart")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
