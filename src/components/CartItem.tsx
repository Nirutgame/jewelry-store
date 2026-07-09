"use client";

import { CartItemType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { HiOutlineTrash } from "react-icons/hi";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
      <Link
        href={`/products/${item.product.id}`}
        className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
      >
        <img
          src={getImageUrl(item.product.images)}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.id}`}>
          <h3 className="font-serif font-semibold text-gray-800 hover:text-gold-700 truncate">
            {item.product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          {item.product.material}
        </p>
        <p className="text-gold-700 font-bold mt-1">
          {formatPrice(item.product.price)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            -
          </button>
          <span className="px-3 py-1 font-medium min-w-[2rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
        >
          <HiOutlineTrash className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
