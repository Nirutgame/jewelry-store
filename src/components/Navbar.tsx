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
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [categories, setCategories] = useState<{ name: string; nameEn: string; slug: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const { t, toggleLanguage, locale } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.filter((c: { slug: string }) => c.slug !== "all")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <nav className="navbar bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-gold-700">
              Lumière
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 tracking-widest uppercase hidden sm:block">
              Jewelry
            </span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("nav.searchPlaceholder")}
                    className="w-28 sm:w-36 lg:w-48 px-3 py-1.5 text-sm border border-gold-300 dark:border-gold-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 bg-gold-50 dark:bg-gray-800 dark:text-gray-100"
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
                  className="text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors p-1.5 sm:p-2"
                  title={t("nav.searchPlaceholder")}
                >
                  <HiOutlineSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            <ThemeToggle />
            {session && (
              <Link
                href="/wishlist"
                className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors p-2"
                title={t("nav.wishlist")}
              >
                <HiOutlineHeart className="w-5 h-5" />
              </Link>
            )}

            <Link
              href="/cart"
              className="text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors p-1.5 sm:p-2"
            >
              <HiOutlineShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            {session ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  href="/orders"
                  className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors p-2"
                  title={t("nav.orders")}
                >
                  <HiOutlineClipboardList className="w-5 h-5" />
                </Link>
                {(role === "admin" || role === "superadmin") && (
                  <Link
                    href="/admin"
                    className="hidden md:block text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors p-2"
                    title={t("nav.admin")}
                  >
                    <HiOutlineShieldCheck className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={async () => { await signOut({ redirect: false }); window.location.href = window.location.origin + "/auth/login"; }}
                  className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-2"
                  title={t("nav.logout")}
                >
                  <HiOutlineLogout className="w-5 h-5" />
                </button>
                <Link
                  href="/orders"
                  className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors"
                  title={t("nav.orders")}
                >
                  <div className="w-6 h-6 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gold-700 dark:text-gold-400">
                      {((session.user as { name?: string } | undefined)?.name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors p-1.5 sm:p-2"
              >
                <HiOutlineUser className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              className="text-[10px] sm:text-xs font-bold tracking-wider text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors px-0.5 sm:px-1.5 lg:px-2 py-0.5 sm:py-1 border border-gold-500 sm:border-2 border-gold-600 dark:border-gold-400 rounded sm:rounded-md"
              title={t("nav.language")}
            >
              {locale === "th" ? "TH" : "EN"}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 p-1.5 sm:p-2"
            >
              {isOpen ? (
                <HiOutlineX className="w-5 h-5" />
              ) : (
                <HiOutlineMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center gap-x-8 py-2 border-t border-gray-200 dark:border-gray-700">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 transition-colors duration-200 text-sm tracking-wide uppercase"
            >
              {locale === "en" && cat.nameEn ? cat.nameEn : cat.name}
            </Link>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="px-4 py-4 space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="block text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 py-2 text-sm tracking-wide uppercase"
              >
                {locale === "en" && cat.nameEn ? cat.nameEn : cat.name}
              </Link>
            ))}
            <hr className="my-2 dark:border-gray-700" />
            {session ? (
              <>
                <Link
                  href="/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 py-2 text-sm"
                >
                  {t("nav.wishlist")}
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 py-2 text-sm"
                >
                  {t("nav.orders")}
                </Link>
                {(role === "admin" || role === "superadmin") && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 py-2 text-sm"
                  >
                    {t("nav.admin")}
                  </Link>
                )}
                <button
                  onClick={async () => { await signOut({ redirect: false }); window.location.href = window.location.origin + "/auth/login"; }}
                  className="block text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 py-2 text-sm"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="block text-gray-600 dark:text-gray-300 hover:text-gold-700 dark:hover:text-gold-400 py-2 text-sm"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
