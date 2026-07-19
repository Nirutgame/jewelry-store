"use client";

import { ProductType } from "@/types";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/context/LanguageContext";

interface ProductGridProps {
  products: ProductType[];
  onAddToCart?: (productId: string) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">{t("products.noProducts")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
