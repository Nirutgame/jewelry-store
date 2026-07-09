"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineClipboardList,
  HiOutlineHeart,
  HiOutlineShieldCheck,
  HiOutlineSearch,
} from "react-icons/hi";

const categories = [
  { name: "แหวน", href: "/products?category=rings" },
  { name: "สร้อยคอ", href: "/products?category=necklaces" },
  { name: "ต่างหู", href: "/products?category=earrings" },
  { name: "กำไล", href: "/products?category=bracelets" },
  { name: "นาฬิกา", href: "/products?category=watches" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl font-serif font-bold text-gold-700">
              Lumière
            </span>
            <span className="text-xs text-gray-400 tracking-widest uppercase hidden sm:block">
              Jewelry
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="text-gray-600 hover:text-gold-700 transition-colors duration-200 text-sm tracking-wide uppercase"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาสินค้า..."
                    className="w-48 lg:w-64 px-3 py-1.5 text-sm border border-gold-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 bg-gold-50"
                  />
                  <button
                    type="submit"
                    className="ml-1 text-gold-600 hover:text-gold-700 p-1.5"
                  >
                    <HiOutlineSearch className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-gray-600 hover:text-gold-700 transition-colors p-2"
                  title="ค้นหา"
                >
                  <HiOutlineSearch className="w-5 h-5" />
                </button>
              )}
            </div>
            {session && (
              <Link
                href="/wishlist"
                className="hidden sm:block text-gray-600 hover:text-gold-700 transition-colors p-2"
                title="รายการที่ชอบ"
              >
                <HiOutlineHeart className="w-5 h-5" />
              </Link>
            )}

            <Link
              href="/cart"
              className="text-gray-600 hover:text-gold-700 transition-colors p-2"
            >
              <HiOutlineShoppingBag className="w-6 h-6" />
            </Link>

            {session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/orders"
                  className="hidden sm:block text-gray-600 hover:text-gold-700 transition-colors p-2"
                  title="ประวัติคำสั่งซื้อ"
                >
                  <HiOutlineClipboardList className="w-5 h-5" />
                </Link>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="hidden sm:block text-gold-600 hover:text-gold-700 transition-colors p-2"
                    title="จัดการร้านค้า"
                  >
                    <HiOutlineShieldCheck className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-rose-600 transition-colors p-2"
                >
                  <HiOutlineLogout className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gold-700 transition-colors p-2"
              >
                <HiOutlineUser className="w-6 h-6" />
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-600 hover:text-gold-700 p-2"
            >
              {isOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-600 hover:text-gold-700 py-2 text-sm tracking-wide uppercase"
              >
                {cat.name}
              </Link>
            ))}
            <hr className="my-2" />
            {session ? (
              <>
                <Link
                  href="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-gold-700 py-2 text-sm"
                >
                  รายการที่ชอบ
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-gold-700 py-2 text-sm"
                >
                  ประวัติคำสั่งซื้อ
                </Link>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block text-gold-600 hover:text-gold-700 py-2 text-sm"
                  >
                    จัดการร้านค้า
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block text-gray-600 hover:text-rose-600 py-2 text-sm"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="block text-gray-600 hover:text-gold-700 py-2 text-sm"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
