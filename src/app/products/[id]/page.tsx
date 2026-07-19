"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProductType } from "@/types";
import { formatPrice, getAllImages } from "@/lib/utils";
import { HiOutlineShoppingBag, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import Link from "next/link";
import StarRating, { StarRatingDisplay } from "@/components/StarRating";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductDetailPage() {
  const params = useParams();
  const [categoryLabels, setCategoryLabels] = useState<Record<string, { name: string; nameEn: string }>>({});
  const { data: session } = useSession();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<{ id: string; rating: number; comment: string | null; createdAt: string; user: { id: string; name: string | null } }[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToast } = useToast();
  const { t, locale } = useLanguage();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const labels: Record<string, { name: string; nameEn: string }> = {};
        data.forEach((c: { slug: string; name: string; nameEn: string }) => { labels[c.slug] = { name: c.name, nameEn: c.nameEn }; });
        setCategoryLabels(labels);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`/api/products/${params.id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setTotalReviews(data.totalReviews || 0);
      })
      .catch(console.error);
  }, [params.id]);

  const handleSubmitReview = async () => {
    if (!session || myRating === 0) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${params.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });
      if (res.ok) {
        const data = await res.json();
        const userId = (session.user as { id: string }).id;
        setReviews((prev) => {
          const existing = prev.some((r) => r.user.id === userId);
          return existing ? prev.map((r) => r.user.id === userId ? data : r) : [data, ...prev];
        });
        const newAvg = [...reviews.filter((r) => r.user.id !== userId), data].reduce((s, r) => s + r.rating, 0) / (totalReviews + 1);
        setAvgRating(Math.round(newAvg * 10) / 10);
        setTotalReviews((prev) => prev + (reviews.some((r) => r.user.id === userId) ? 0 : 1));
        setMyRating(0);
        setMyComment("");
      }
    } catch {
      console.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: params.id, quantity }),
      });
      if (res.ok) {
        addToast(t("products.addToCart") + " " + t("cart.title"), "success");
      } else {
        const data = await res.json();
        addToast(data.message || t("checkout.total"), "error");
      }
    } catch {
      addToast(t("checkout.total"), "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t("products.noProducts")}
        </h2>
        <Link href="/products" className="text-gold-600 dark:text-gold-400 hover:underline">
          {t("products.title")}
        </Link>
      </div>
    );
  }

  const images = getAllImages(product.images);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: locale === "en" && product.nameEn ? product.nameEn : product.name,
    description: locale === "en" && product.descriptionEn ? product.descriptionEn : product.description,
    image: images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "THB",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          href="/products"
          className="text-gray-500 dark:text-gray-400 hover:text-gold-700 dark:hover:text-gold-400 flex items-center gap-1 text-sm"
        >
          <HiOutlineChevronLeft className="w-4 h-4" />
          {t("products.title")}
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
            <img
              src={images[currentImage]}
              alt={locale === "en" && product.nameEn ? product.nameEn : product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                >
                  <HiOutlineChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImage
                      ? "border-gold-600 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${locale === "en" && product.nameEn ? product.nameEn : product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-2">
            {(() => { const cat = categoryLabels[product.category]; return cat ? (locale === "en" && cat.nameEn ? cat.nameEn : cat.name) : product.category; })()}
          </p>
          <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
            {locale === "en" && product.nameEn ? product.nameEn : product.name}
          </h1>
          <p className="text-3xl font-bold text-gold-700 dark:text-gold-400 mb-6">
            {formatPrice(product.price)}
          </p>

          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {locale === "en" && product.descriptionEn ? product.descriptionEn : product.description}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-20">{t("products.material")}:</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">{locale === "en" && product.materialEn ? product.materialEn : product.material}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-20">{t("products.stock")}:</span>
              <span className={`font-medium ${
                product.stock > 0 ? "text-green-600" : "text-rose-600"
              }`}>
                {product.stock > 0 ? `${product.stock} ${t("products.pieces")}` : t("products.outOfStock")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-3 font-medium min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary flex items-center justify-center gap-2 text-lg w-full md:w-auto"
          >
            <HiOutlineShoppingBag className="w-5 h-5" />
            {t("products.addToCart")}
          </button>

          {totalReviews > 0 && (
            <div className="mt-8">
              <StarRatingDisplay rating={avgRating} count={totalReviews} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-8">
          {t("products.reviews")} ({totalReviews})
        </h2>

        {session && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{t("products.writeReview")}</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("products.yourRating")}</p>
              <StarRating rating={myRating} size="lg" interactive={true} onChange={setMyRating} />
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder={t("products.yourComment")}
              className="input-field mb-4"
              rows={3}
            />
            <button
              onClick={handleSubmitReview}
              disabled={myRating === 0 || submittingReview}
              className="btn-primary"
            >
              {submittingReview ? t("common.loading") : t("products.submitReview")}
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-12">{t("products.noReviews")}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 rounded-full flex items-center justify-center">
                      <span className="text-gold-700 dark:text-gold-400 font-semibold text-sm">
                        {(review.user.name || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{review.user.name || t("auth.name")}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
