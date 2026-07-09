"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from "react-icons/hi";
import { useToast } from "@/components/Toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { addToast } = useToast();

  const fetchProducts = () => {
    setLoading(true);
    let url = "/api/admin/products";
    const params = new URLSearchParams();
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (search) params.set("search", search);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    fetch(url)
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบสินค้า "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        addToast("ลบสินค้าสำเร็จ", "success");
      } else {
        addToast("เกิดข้อผิดพลาดในการลบสินค้า", "error");
      }
    } catch {
      addToast("เกิดข้อผิดพลาด", "error");
    }
  };

  const categoryLabels: Record<string, string> = {
    rings: "แหวน",
    necklaces: "สร้อยคอ",
    earrings: "ต่างหู",
    bracelets: "กำไล",
    watches: "นาฬิกา",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800">
          จัดการสินค้า
        </h1>
        <Link href="/admin/products/create" className="btn-primary flex items-center gap-2 text-sm w-fit">
          <HiOutlinePlus className="w-4 h-4" />
          เพิ่มสินค้า
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
              placeholder="ค้นหาสินค้า..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary text-sm py-2 px-4">
            ค้นหา
          </button>
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">ทั้งหมด</option>
          <option value="rings">แหวน</option>
          <option value="necklaces">สร้อยคอ</option>
          <option value="earrings">ต่างหู</option>
          <option value="bracelets">กำไล</option>
          <option value="watches">นาฬิกา</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">ยังไม่มีสินค้า</div>
      ) : (
        <>
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">สินค้า</th>
                    <th className="px-4 py-3 font-medium">ราคา</th>
                    <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                    <th className="px-4 py-3 font-medium">สต็อก</th>
                    <th className="px-4 py-3 font-medium">แนะนำ</th>
                    <th className="px-4 py-3 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(product.images)}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-gray-800 truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {categoryLabels[product.category] || product.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`${
                            product.stock > 0 ? "text-green-600" : "text-rose-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.featured ? (
                          <span className="text-emerald-600">★</span>
                        ) : (
                          <span className="text-gray-300">★</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบ"
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
              <div key={product.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={getImageUrl(product.images)}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {categoryLabels[product.category] || product.category}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-gold-700">{formatPrice(product.price)}</span>
                      <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-rose-600"}`}>
                        {product.stock > 0 ? `${product.stock} ชิ้น` : "หมด"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
