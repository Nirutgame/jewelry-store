"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineX } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

function CreateProductForm() {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") || "";
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<{ slug: string; name: string; nameEn: string }[]>([]);
  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    price: "",
    category: defaultCategory,
    material: "",
    materialEn: "",
    stock: "10",
    featured: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { t, locale } = useLanguage();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.ok ? res.json() : Promise.reject(res.status))
      .then((data) => {
        if (!Array.isArray(data)) { setCategories([]); return; }
        setCategories(data);
        const catFromUrl = searchParams.get("category");
        if (catFromUrl && data.some((c: { slug: string }) => c.slug === catFromUrl)) {
          setForm((prev) => ({ ...prev, category: catFromUrl }));
        } else if (data.length > 0 && !form.category) {
          setForm((prev) => ({ ...prev, category: data[0].slug }));
        }
      })
      .catch(() => { setCategories([]); });
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");

    if (!form.name || !form.description || !form.price) {
      setError(t("checkout.total"));
      setUploading(false);
      return;
    }

    try {
      let images: string[] = [];

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((f) => formData.append("files", f));
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          setError(t("admin.uploadImage"));
          setUploading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        images = uploadData.urls;
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: JSON.stringify(images) }),
      });

      if (res.ok) {
        const catParam = searchParams.get("category");
        router.push(catParam ? `/admin/products?category=${catParam}` : "/admin/products");
      } else {
        const data = await res.json();
        setError(data.message || t("checkout.total"));
      }
    } catch {
      setError(t("checkout.total"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/products"
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gold-700 dark:hover:text-gold-400 mb-6 text-sm"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        {t("admin.manageProducts")}
      </Link>

      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
        {t("admin.addProduct")}
      </h1>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ชื่อสินค้า (ไทย) *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="แหวนเพชรคลาสสิก"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Product Name (English) *</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="input-field"
              placeholder="Classic Diamond Ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">คำอธิบาย (ไทย) *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[100px]"
              placeholder="รายละเอียดสินค้าภาษาไทย"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description (English) *</label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              className="input-field min-h-[100px]"
              placeholder="Product description in English"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("checkout.total")} *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("products.stock")}
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("admin.categories")}
              </label>
              {searchParams.get("category") ? (
                <div className="input-field bg-gray-50 dark:bg-gray-700 cursor-default flex items-center">
                  {(() => { const c = categories.find((c) => c.slug === form.category); return c ? (locale === "en" && c.nameEn ? c.nameEn : c.name) : form.category; })()}
                </div>
              ) : (
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  {categories.length === 0 && <option value="">{t("common.loading")}</option>}
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{locale === "en" && cat.nameEn ? cat.nameEn : cat.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">วัสดุ (ไทย)</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="input-field"
                placeholder="ทองคำแท้ 24K"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Material (English)</label>
              <input
                type="text"
                value={form.materialEn}
                onChange={(e) => setForm({ ...form, materialEn: e.target.value })}
                className="input-field"
                placeholder="24K Pure Gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("admin.uploadImage")}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gold-400 transition-colors"
            >
              <HiOutlinePhotograph className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin.uploadImage")}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t("admin.uploadImage")}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 text-gold-600 rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-200">
              {t("home.featuredProducts")}
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary"
          >
            {uploading ? t("common.loading") : t("admin.save")}
          </button>
          <Link
            href="/admin/products"
            className="btn-secondary"
          >
            {t("admin.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    }>
      <CreateProductForm />
    </Suspense>
  );
}
