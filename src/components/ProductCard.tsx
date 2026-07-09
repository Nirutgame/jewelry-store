"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ProductType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlineShoppingBag, HiOutlineHeart, HiHeart, HiStar } from "react-icons/hi";

interface ProductCardProps {
  product: ProductType;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { data: session } = useSession();
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/wishlist/check?productId=${product.id}`)
      .then((res) => res.json())
      .then((data) => setInWishlist(data.inWishlist))
      .catch(() => {});
  }, [session, product.id]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        setInWishlist(!inWishlist);
      }
    } catch {
      console.error("Failed to toggle wishlist");
    }
  };

  return (
    <div className="card overflow-hidden group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${product.id}`}>
          <img
            src={getImageUrl(product.images)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-rose-600 text-white text-xs font-medium rounded-full">
            สินค้าหมด
          </div>
        )}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
            inWishlist
              ? "bg-rose-50 text-rose-500"
              : "bg-white/80 text-gray-400 hover:bg-white hover:text-rose-500"
          }`}
          title={inWishlist ? "ลบออกจากรายการที่ชอบ" : "เพิ่มในรายการที่ชอบ"}
        >
          {inWishlist ? (
            <HiHeart className="w-5 h-5" />
          ) : (
            <HiOutlineHeart className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs text-gold-600 uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-serif text-lg font-semibold text-gray-800 hover:text-gold-700 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        {(product.avgRating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <HiStar className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{product.avgRating?.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.totalReviews} รีวิว)</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gold-700">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-amber-600">
                เหลือ {product.stock} ชิ้น
              </span>
            )}
          </div>
          <button
            onClick={() => onAddToCart?.(product.id)}
            disabled={product.stock === 0}
            className={`p-2 rounded-full transition-colors ${
              product.stock === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gold-600 text-white hover:bg-gold-700"
            }`}
          >
            <HiOutlineShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
