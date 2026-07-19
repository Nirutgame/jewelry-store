"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import StarRating from "@/components/StarRating";
import { getImageUrl } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  product: { id: string; name: string; nameEn: string; images: string };
}

function ReviewsContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();
  const { t, locale } = useLanguage();

  const fetchReviews = (page: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (productId) params.set("productId", productId);
    fetch(`/api/admin/reviews?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews(1);
  }, [productId]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        addToast(t("review.delete"), "success");
      } else {
        addToast(t("checkout.total"), "error");
      }
    } catch {
      addToast(t("checkout.total"), "error");
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isVisible: !current }),
      });
      if (res.ok) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isVisible: !current } : r)));
        addToast(!current ? t("review.show") : t("review.hide"), "success");
      } else {
        addToast(t("checkout.total"), "error");
      }
    } catch {
      addToast(t("checkout.total"), "error");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchReviews(page);
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
        {t("admin.manageReviews")}
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t("review.noReviews")}</div>
      ) : (
        <>
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">{t("review.product")}</th>
                    <th className="px-4 py-3 font-medium">{t("review.customer")}</th>
                    <th className="px-4 py-3 font-medium">{t("review.rating")}</th>
                    <th className="px-4 py-3 font-medium">{t("review.comment")}</th>
                    <th className="px-4 py-3 font-medium">{t("orders.status")}</th>
                    <th className="px-4 py-3 font-medium">{t("review.date")}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(review.product.images)}
                            alt={locale === "en" && review.product.nameEn ? review.product.nameEn : review.product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[180px]">
                            {locale === "en" && review.product.nameEn ? review.product.nameEn : review.product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {review.user.name || review.user.email}
                      </td>
                      <td className="px-4 py-3">
                        <StarRating rating={review.rating} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[250px] truncate">
                        {review.comment || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          review.isVisible
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}>
                          {review.isVisible ? t("review.visible") : t("review.hidden")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                            className={`p-2 rounded-lg transition-colors ${
                              review.isVisible
                                ? "text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                                : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                            }`}
                            title={review.isVisible ? t("review.hide") : t("review.show")}
                          >
                            {review.isVisible ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                            title={t("review.delete")}
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
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={getImageUrl(review.product.images)}
                    alt={locale === "en" && review.product.nameEn ? review.product.nameEn : review.product.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{locale === "en" && review.product.nameEn ? review.product.nameEn : review.product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{review.user.name || review.user.email}</p>
                    <div className="mt-1">
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{review.comment}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        review.isVisible
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}>
                        {review.isVisible ? t("review.visible") : t("review.hidden")}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                        className={`text-xs ${review.isVisible ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"} hover:underline`}
                      >
                        {review.isVisible ? t("review.hide") : t("review.show")}
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        {t("review.delete")}
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
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
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
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    }>
      <ReviewsContent />
    </Suspense>
  );
}
