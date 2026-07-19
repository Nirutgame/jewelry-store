"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CartItem from "@/components/CartItem";
import { CartItemType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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
      }
    } catch {
      console.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });

      if (res.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      }
    } catch {
      console.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      console.error("Failed to remove item");
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (status === "loading" || loading) {
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
        {t("cart.title")}
      </h1>

      {cartItems.length === 0 ? (
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
        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}

      {cartItems.length > 0 && (
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
      )}
    </div>
  );
}
