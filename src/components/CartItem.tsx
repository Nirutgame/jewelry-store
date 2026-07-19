"use client";

import { CartItemType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { HiOutlineTrash } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { locale } = useLanguage();
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl shadow-sm">
      <Link
        href={`/products/${item.product.id}`}
        className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
      >
        <img
          src={getImageUrl(item.product.images)}
          alt={locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.id}`}>
          <h3 className="font-serif font-semibold text-gray-800 dark:text-gray-100 hover:text-gold-700 dark:hover:text-gold-400 truncate">
            {locale === "en" && item.product.nameEn ? item.product.nameEn : item.product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {item.product.material}
        </p>
        <p className="text-gold-700 dark:text-gold-400 font-bold mt-1">
          {formatPrice(item.product.price)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center border dark:border-gray-600 rounded-lg">
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            -
          </button>
          <span className="px-3 py-1 font-medium min-w-[2rem] text-center dark:text-gray-100">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
