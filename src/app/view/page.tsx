"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ProductType } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { HiOutlineShoppingBag, HiOutlineEye } from "react-icons/hi";
import { useToast } from "@/components/Toast";

const categoryLabels: Record<string, string> = {
  rings: "แหวน",
  necklaces: "สร้อยคอ",
  earrings: "ต่างหู",
  bracelets: "กำไล",
  watches: "นาฬิกา",
};

const categoryImages: Record<string, string> = {
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
  earrings: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80",
  bracelets: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
  watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
};

export default function ViewPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { addToast } = useToast();

  useEffect(() => {
    fetch("/api/products?limit=50")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
      if (res.ok) addToast("เพิ่มสินค้าในตะกร้าเรียบร้อย", "success");
    } catch {
      addToast("เกิดข้อผิดพลาด", "error");
    }
  };

  const grouped = products.reduce<Record<string, ProductType[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    if (acc[p.category].length < 2) acc[p.category].push(p);
    return acc;
  }, {});

  const categories = Object.keys(categoryLabels).filter((c) => grouped[c]?.length);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-16">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="aspect-[4/5] bg-gray-200 rounded-xl" />
                <div className="aspect-[4/5] bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-gray-800 mb-4">
            Lumière Collection
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            สัมผัสความงดงามของเครื่องประดับจากคอลเลกชั่นล่าสุดของเรา
            แต่ละชิ้นถูกออกแบบมาเพื่อให้คุณเปล่งประกายในทุกโอกาส
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">ยังไม่มีสินค้าในระบบ</p>
          </div>
        ) : (
          <div className="space-y-20">
            {categories.map((cat) => (
              <section key={cat}>
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                    <img
                      src={categoryImages[cat]}
                      alt={categoryLabels[cat]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-800">
                      {categoryLabels[cat]}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      คัดสรรเครื่องประดับคุณภาพสูง
                    </p>
                  </div>
                  <Link
                    href={`/products?category=${cat}`}
                    className="ml-auto text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
                  >
                    ดูทั้งหมด <HiOutlineEye className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {grouped[cat].map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row"
                    >
                      <div className="relative w-full sm:w-1/2 aspect-square sm:aspect-[4/5] overflow-hidden">
                        <Link href={`/products/${product.id}`}>
                          <img
                            src={getImageUrl(product.images)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </Link>
                        {product.stock === 0 && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-rose-600 text-white text-xs font-medium rounded-full">
                            สินค้าหมด
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-gold-600 uppercase tracking-widest mb-2">
                            {categoryLabels[product.category] || product.category}
                          </p>
                          <Link href={`/products/${product.id}`}>
                            <h3 className="font-serif text-xl font-semibold text-gray-800 hover:text-gold-700 transition-colors mb-2">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                          {product.material && (
                            <p className="text-xs text-gray-400 mb-2">
                              วัสดุ: {product.material}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <span className="text-2xl font-bold text-gold-700">
                            {formatPrice(product.price)}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0}
                            className={`p-3 rounded-xl transition-all ${
                              product.stock === 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gold-600 text-white hover:bg-gold-700 hover:shadow-lg hover:shadow-gold-600/30 active:scale-95"
                            }`}
                          >
                            <HiOutlineShoppingBag className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
