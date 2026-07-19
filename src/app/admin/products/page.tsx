"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiStar } from "react-icons/hi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();
  const { t, locale } = useLanguage();

  useEffect(() => {
    setCategoryFilter(urlCategory);
    setCurrentPage(1);
  }, [urlCategory]);

  const fetchProducts = (page: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (search) params.set("search", search);
    params.set("page", page.toString());
    params.set("limit", "20");

    fetch(`/api/admin/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(1);
  }, [categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t("admin.confirmDelete")} "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        addToast(t("admin.delete") + " " + t("admin.save"), "success");
      } else {
        addToast(t("checkout.total"), "error");
      }
    } catch {
      addToast(t("checkout.total"), "error");
    }
  };

  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        const labels: Record<string, string> = {};
        data.forEach((c: { slug: string; name: string }) => { labels[c.slug] = c.name; });
        setCategoryLabels(labels);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">
          {t("admin.manageProducts")}
        </h1>
        <Link href={`/admin/products/create${categoryFilter !== "all" ? `?category=${categoryFilter}` : ""}`} className="btn-primary flex items-center gap-2 text-sm w-fit">
          <HiOutlinePlus className="w-4 h-4" />
          {t("admin.addProduct")}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.search")}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary text-sm py-2 px-4">
            {t("admin.search")}
          </button>
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">{t("admin.allStatus")}</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t("admin.noData")}</div>
      ) : (
        <>
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">{t("admin.products")}</th>
                    <th className="px-4 py-3 font-medium">{t("checkout.total")}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.categories")}</th>
                    <th className="px-4 py-3 font-medium">{t("products.stock")}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.reviews")}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.products")}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(product.images)}
                            alt={locale === "en" && product.nameEn ? product.nameEn : product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[200px]">
                            {locale === "en" && product.nameEn ? product.nameEn : product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {categoryLabels[product.category] || product.category}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${product.stock > 0 ? "text-green-600" : "text-rose-600"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {(product.avgRating ?? 0) > 0 ? (
                          <Link
                            href={`/admin/reviews?productId=${product.id}`}
                            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-600 transition-colors"
                          >
                            <HiStar className="w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {product.avgRating?.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              ({product.totalReviews})
                            </span>
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.featured ? (
                          <span className="text-emerald-600">★</span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">★</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title={t("admin.edit")}
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                            title={t("admin.delete")}
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sm:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={getImageUrl(product.images)}
                     alt={locale === "en" && product.nameEn ? product.nameEn : product.name}
                     className="w-16 h-16 rounded-lg object-cover shrink-0"
                   />
                   <div className="flex-1 min-w-0">
                     <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">{locale === "en" && product.nameEn ? product.nameEn : product.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {categoryLabels[product.category] || product.category}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-gold-700 dark:text-gold-400">{formatPrice(product.price)}</span>
                      <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-rose-600"}`}>
                        {product.stock > 0 ? `${product.stock} ${t("products.pieces")}` : t("products.outOfStock")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      {(product.avgRating ?? 0) > 0 ? (
                        <Link href={`/admin/reviews?productId=${product.id}`} className="flex items-center gap-1 text-yellow-500">
                          <HiStar className="w-3.5 h-3.5" />
                          <span className="text-gray-600 dark:text-gray-300">{product.avgRating?.toFixed(1)}</span>
                          <span className="text-gray-400 dark:text-gray-500">({product.totalReviews})</span>
                        </Link>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">{t("products.noReviews")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        {t("admin.edit")}
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="text-xs text-rose-600 dark:text-rose-400 hover:underline">
                        {t("admin.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                {t("products.previous")}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-gold-600 text-white"
                      : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                {t("products.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
