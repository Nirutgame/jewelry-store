"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/context/LanguageContext";

export interface CartItemData {
  productId: string;
  cartItemId?: string;
  quantity: number;
  name: string;
  nameEn?: string;
  price: number;
  image: string;
  stock: number;
}

interface CartContextType {
  items: CartItemData[];
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => void;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "guest_cart";

function loadGuestCart(): CartItemData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItemData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.warn("Failed to save guest cart to localStorage");
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { t } = useLanguage();

  // Load cart on mount
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const guestItems = loadGuestCart();
            const dbItems: CartItemData[] = data.map((ci: { id: string; product: { id: string; name: string; nameEn?: string; price: number; images: string; stock: number }; quantity: number }) => ({
              productId: ci.product.id,
              cartItemId: ci.id,
              quantity: ci.quantity,
              name: ci.product.name,
              nameEn: ci.product.nameEn,
              price: ci.product.price,
              image: (() => { try { return JSON.parse(ci.product.images)[0] || "/placeholder.svg"; } catch { return "/placeholder.svg"; } })(),
              stock: ci.product.stock,
            }));

            // Merge guest cart into DB
            if (guestItems.length > 0) {
              for (const gItem of guestItems) {
                const existing = dbItems.find((i) => i.productId === gItem.productId);
                if (existing) {
                  fetch("/api/cart", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: existing.cartItemId, quantity: existing.quantity + gItem.quantity }),
                  }).catch(() => {});
                } else {
                  fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: gItem.productId, quantity: gItem.quantity }),
                  }).catch(() => {});
                }
              }
              localStorage.removeItem(STORAGE_KEY);
              // Re-fetch after merge
              fetch("/api/cart").then((r) => r.json()).then((d) => {
                if (Array.isArray(d)) {
                  setItems(d.map((ci: { id: string; product: { id: string; name: string; nameEn?: string; price: number; images: string; stock: number }; quantity: number }) => ({
                    productId: ci.product.id,
                    cartItemId: ci.id,
                    quantity: ci.quantity,
                    name: ci.product.name,
                    nameEn: ci.product.nameEn,
                    price: ci.product.price,
                    image: (() => { try { return JSON.parse(ci.product.images)[0] || "/placeholder.svg"; } catch { return "/placeholder.svg"; } })(),
                    stock: ci.product.stock,
                  })));
                }
              });
              return;
            }
            setItems(dbItems);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setItems(loadGuestCart());
      setLoading(false);
    }
  }, [status]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) {
      addToast("ไม่สามารถเพิ่มสินค้าได้ กรุณาลองอีกครั้ง", "error");
      return;
    }
    const product = await res.json();

    if (product.stock < quantity) {
      addToast(`สินค้ามีเพียง ${product.stock} ชิ้นในสต็อก`, "error");
      return;
    }

    if (status === "authenticated") {
      const cartRes = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (cartRes.ok) {
        const img = (() => { try { return JSON.parse(product.images)[0] || "/placeholder.svg"; } catch { return "/placeholder.svg"; } })();
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i);
          return [...prev, { productId, quantity, name: product.name, nameEn: product.nameEn, price: product.price, image: img, stock: product.stock }];
        });
        addToast(t("products.addToCart") + " " + t("cart.title"), "success");
      }
    } else {
      const img = (() => { try { return JSON.parse(product.images)[0] || "/placeholder.svg"; } catch { return "/placeholder.svg"; } })();
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        const newItems = existing
          ? prev.map((i) => i.productId === productId ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) } : i)
          : [...prev, { productId, quantity, name: product.name, nameEn: product.nameEn, price: product.price, image: img, stock: product.stock }];
        saveGuestCart(newItems);
        return newItems;
      });
      addToast(t("products.addToCart") + " " + t("cart.title"), "success");
    }
  }, [status, addToast, t]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    if (status === "authenticated") {
      const item = items.find((i) => i.productId === productId);
      if (item?.cartItemId) {
        const cartRes = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.cartItemId, quantity }),
        });
        if (!cartRes.ok) return;
      } else {
        const cartRes = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        if (!cartRes.ok) return;
      }
    }
    setItems((prev) => {
      const newItems = prev.map((i) => i.productId === productId ? { ...i, quantity } : i);
      if (status !== "authenticated") saveGuestCart(newItems);
      return newItems;
    });
  }, [status, items]);

  const removeItem = useCallback(async (productId: string) => {
    if (status === "authenticated") {
      const item = items.find((i) => i.productId === productId);
      if (item?.cartItemId) {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.cartItemId }),
        });
      }
    }
    setItems((prev) => {
      const newItems = prev.filter((i) => i.productId !== productId);
      if (status !== "authenticated") saveGuestCart(newItems);
      return newItems;
    });
  }, [status, items]);

  const clearCart = useCallback(() => {
    if (status === "authenticated") {
      fetch("/api/cart", { method: "DELETE" }).catch(() => {});
    }
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [status]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total, itemCount, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
