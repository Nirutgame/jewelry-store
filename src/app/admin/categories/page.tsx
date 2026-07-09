"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineCube, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { useToast } from "@/components/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

const categoryImages: Record<string, string> = {
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
  earrings: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80",
  bracelets: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
  watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: "", slug: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editCat) {
        const res = await fetch(`/api/admin/categories/${editCat.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name }),
        });
        if (res.ok) {
          setShowModal(false);
          fetchCategories();
        } else {
          const data = await res.json();
          setError(data.message || "เกิดข้อผิดพลาด");
        }
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setShowModal(false);
          fetchCategories();
        } else {
          const data = await res.json();
          setError(data.message || "เกิดข้อผิดพลาด");
        }
      }
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`ยืนยันการลบหมวดหมู่ "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCategories();
        addToast("ลบหมวดหมู่สำเร็จ", "success");
      } else {
        const data = await res.json();
        addToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      addToast("เกิดข้อผิดพลาด", "error");
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
        <h1 className="text-2xl font-serif font-bold text-gray-800">
          จัดการหมวดหมู่
        </h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative group">
              <img
                src={categoryImages[cat.slug] || ""}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 bg-white rounded-lg shadow text-blue-600 hover:bg-blue-50"
                  title="แก้ไข"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 bg-white rounded-lg shadow text-rose-600 hover:bg-rose-50"
                  title="ลบ"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-gray-800">
                  {cat.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <HiOutlineCube className="w-4 h-4" />
                <span>{cat.productCount} สินค้า</span>
              </div>
              <Link
                href={`/admin/products?category=${cat.slug}`}
                className="mt-3 inline-block text-sm text-gold-600 hover:underline"
              >
                ดูสินค้าในหมวดนี้ →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
              {editCat ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
            </h2>
            {error && (
              <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="เช่น แหวน"
                  required
                />
              </div>
              {!editCat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input-field"
                    placeholder="เช่น rings"
                    required
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
