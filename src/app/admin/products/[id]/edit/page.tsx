"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineX } from "react-icons/hi";
import { ProductType } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    price: "",
    category: "rings",
    material: "",
    stock: "10",
    featured: false,
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => { setCategories(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((res) => res.json())
      .then((product: ProductType) => {
        setForm({
          name: product.name,
          nameEn: product.nameEn || "",
          description: product.description,
          descriptionEn: product.descriptionEn || "",
          price: product.price.toString(),
          category: product.category,
          material: product.material,
          stock: product.stock.toString(),
          featured: product.featured,
        });
        const parsed = JSON.parse(product.images);
        setExistingImages(parsed);
        setLoading(false);
      })
      .catch(() => {
        setError(t("products.noProducts"));
        setLoading(false);
      });
  }, [params.id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...newImageFiles, ...files];
    setNewImageFiles(newFiles);

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let images = [...existingImages];

      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach((f) => formData.append("files", f));
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          setError(t("admin.uploadImage"));
          setSaving(false);
          return;
        }

        const uploadData = await uploadRes.json();
        images = [...images, ...uploadData.urls];
      }

      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: JSON.stringify(images) }),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        const data = await res.json();
        setError(data.message || t("checkout.total"));
      }
    } catch {
      setError(t("checkout.total"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

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
        {t("admin.edit")}
      </h1>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("admin.products")} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("products.description")} *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[120px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Name (English) *
            </label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Description (English) *
            </label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              className="input-field min-h-[120px]"
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
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("admin.categories")}
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t("products.material")}
              </label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t("admin.uploadImage")}
            </label>

            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`รูป ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

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

            {newImagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {newImagePreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
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
            disabled={saving}
            className="btn-primary"
          >
            {saving ? t("common.loading") : t("admin.save")}
          </button>
          <Link href="/admin/products" className="btn-secondary">
            {t("admin.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
