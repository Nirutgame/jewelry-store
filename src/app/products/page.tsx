"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProductGrid from "@/components/ProductGrid";
import { ProductType, CategoryType } from "@/types";
import { HiOutlineSearch } from "react-icons/hi";
import { useToast } from "@/components/Toast";

const categories: { label: string; value: CategoryType }[] = [
  { label: "ทั้งหมด", value: "all" },
  { label: "แหวน", value: "rings" },
  { label: "สร้อยคอ", value: "necklaces" },
  { label: "ต่างหู", value: "earrings" },
  { label: "กำไล", value: "bracelets" },
  { label: "นาฬิกา", value: "watches" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = (searchParams.get("category") || "all") as CategoryType;
  const searchQuery = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { data: session } = useSession();
  const { addToast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentCategory !== "all") params.set("category", currentCategory);
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", String(currentPage));
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, searchQuery, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    }, 400);
  };

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        addToast("เพิ่มสินค้าในตะกร้าเรียบร้อย", "success");
      }
    } catch {
      addToast("เกิดข้อผิดพลาด", "error");
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
          สินค้าทั้งหมด
        </h1>
        <p className="text-gray-500">
          ค้นพบเครื่องประดับที่ใช่สำหรับคุณ
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.value;
            const params = new URLSearchParams(searchParams.toString());
            if (cat.value === "all") params.delete("category");
            else params.set("category", cat.value);
            params.set("page", "1");
            const href = `/products?${params.toString()}`;

            return (
              <a
                key={cat.value}
                href={href}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gold-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gold-50 hover:text-gold-700 border border-gray-200"
                }`}
              >
                {cat.label}
              </a>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
          />
        </div>
      </div>

      {searchQuery && (
        <p className="text-gray-500 mb-6">
          ผลการค้นหา &ldquo;{searchQuery}&rdquo; พบ {total} รายการ
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-gray-600 mb-2">ไม่พบสินค้า</h2>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? `ไม่พบสินค้าที่ตรงกับ "${searchQuery}"`
              : "ยังไม่มีสินค้าในหมวดนี้"}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("search");
                params.set("page", "1");
                router.push(`/products?${params.toString()}`);
              }}
              className="btn-primary"
            >
              ล้างการค้นหา
            </button>
          )}
        </div>
      ) : (
        <>
          <ProductGrid products={products} onAddToCart={handleAddToCart} />
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 hover:text-gold-700 transition-colors"
              >
                ก่อนหน้า
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-gold-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gold-50 hover:text-gold-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 hover:text-gold-700 transition-colors"
              >
                ถัดไป
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
