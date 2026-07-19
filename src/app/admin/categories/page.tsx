"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineCube, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowUp, HiOutlineArrowDown } from "react-icons/hi";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  const { t } = useLanguage();

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: "", slug: "", description: "", image: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", image: cat.image || "" });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editCat ? `/api/admin/categories/${editCat.slug}` : "/api/admin/categories";
      const method = editCat ? "PUT" : "POST";
      const body = editCat ? { name: form.name, description: form.description, image: form.image } : form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchCategories();
        addToast(editCat ? t("admin.edit") + " " + t("admin.categories") : t("admin.addCategory"), "success");
      } else {
        const data = await res.json();
        setError(data.message || t("checkout.total"));
      }
    } catch { setError(t("checkout.total")); }
    finally { setSaving(false); }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`${t("admin.confirmDelete")} "${cat.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${cat.slug}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
        addToast(t("admin.delete"), "success");
      } else {
        const data = await res.json();
        addToast(data.message || t("checkout.total"), "error");
      }
    } catch { addToast(t("checkout.total"), "error"); }
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const newCats = [...categories];
    const target = index + direction;
    if (target < 0 || target >= newCats.length) return;
    [newCats[index], newCats[target]] = [newCats[target], newCats[index]];

    const updated = newCats.map((cat, i) => ({ ...cat, sortOrder: i }));
    setCategories(updated);

    for (const cat of updated) {
      await fetch(`/api/admin/categories/${cat.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cat.name, description: cat.description, image: cat.image, sortOrder: cat.sortOrder }),
      }).catch(() => {});
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">{t("admin.manageCategories")}</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> {t("admin.addCategory")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700 relative group">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                  <HiOutlineCube className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30" title={t("admin.edit")}>
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat)} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30" title={t("admin.delete")}>
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveCategory(idx, -1)} disabled={idx === 0} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700" title={t("common.back")}>
                  <HiOutlineArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveCategory(idx, 1)} disabled={idx === categories.length - 1} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700" title={t("common.back")}>
                  <HiOutlineArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100">{cat.name}</h3>
              {cat.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <HiOutlineCube className="w-4 h-4" />
                <span>{cat.productCount} {t("products.pieces")}</span>
              </div>
              <Link href={`/admin/products?category=${cat.slug}`} className="mt-3 inline-block text-sm text-gold-600 dark:text-gold-400 hover:underline">
                {t("admin.products")} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {editCat ? t("admin.edit") + " " + t("admin.categories") : t("admin.addCategory")}
            </h2>
            {error && <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("admin.categories")}</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder={t("admin.categories")} required />
              </div>
              {!editCat && <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("admin.slug")}</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="rings" required />
              </div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("products.description")}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder={t("products.description")} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("admin.uploadImage")}</label>
                <div className="flex gap-2">
                  <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field flex-1" placeholder={t("admin.uploadImage")} />
                  <label className="btn-secondary cursor-pointer text-sm flex items-center gap-1 whitespace-nowrap">
                    <HiOutlinePlus className="w-4 h-4" />
                    {t("admin.uploadImage")}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const fd = new FormData();
                      fd.append("file", f);
                      try {
                        const res = await fetch("/api/upload/category", { method: "POST", body: fd });
                        if (res.ok) {
                          const data = await res.json();
                          setForm({ ...form, image: data.url });
                          addToast(t("admin.uploadImage"), "success");
                        }
                      } catch { addToast(t("admin.uploadImage"), "error"); }
                    }} />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? t("common.loading") : t("admin.save")}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">{t("admin.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
