"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineCollection,
  HiOutlineArrowLeft,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

const sidebarLinks = [
  { nameKey: "admin.dashboard", href: "/admin", icon: HiOutlineViewGrid },
  { nameKey: "admin.products", href: "/admin/products", icon: HiOutlineCube },
  { nameKey: "admin.customers", href: "/admin/customers", icon: HiOutlineUsers },
  { nameKey: "admin.orders", href: "/admin/orders", icon: HiOutlineShoppingBag },
  { nameKey: "admin.categories", href: "/admin/categories", icon: HiOutlineCollection },
  { nameKey: "admin.promocodes", href: "/admin/promocodes", icon: HiOutlineTag },
  { nameKey: "admin.reviews", href: "/admin/reviews", icon: HiOutlineStar },
  { nameKey: "admin.users", href: "/admin/users", icon: HiOutlineShieldCheck, adminOnly: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t("common.unauthorized")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t("common.unauthorizedDesc")}</p>
          <Link href="/" className="btn-primary">
            {t("common.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-100 dark:bg-gray-900 flex" data-admin-root>
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm hidden md:block">
        <div className="p-6 border-b dark:border-gray-700">
          <Link href="/admin" className="text-2xl font-serif font-bold text-gold-700 dark:text-gold-400">
            Admin Panel
          </Link>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Lumière Jewelry</p>
        </div>
        <div className="px-6 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center text-gold-700 dark:text-gold-400 font-bold text-sm shrink-0">
            {(session?.user?.name || session?.user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
              {session?.user?.name || session?.user?.email}
            </p>
            <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${
              role === "superadmin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            }`}>
              {role}
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.filter(l => !l.adminOnly || role === "superadmin").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors"
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{t(link.nameKey)}</span>
            </Link>
          ))}
          <hr className="my-4" />
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t("admin.backToStore")}</span>
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between md:hidden">
          <Link href="/admin" className="text-xl font-serif font-bold text-gold-700 dark:text-gold-400">
            Admin Panel
          </Link>
          <Link href="/" className="text-sm text-gray-500 dark:text-gray-400">
            {t("admin.backToStore")}
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 pb-0 scroll-buffer">{children}</main>

        <nav className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex md:hidden items-center z-50 overflow-x-auto flex-nowrap px-1 py-1.5 gap-1">
          {sidebarLinks.filter(l => !l.adminOnly || role === "superadmin").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gold-700 dark:hover:text-gold-400 transition-colors shrink-0"
            >
              <link.icon className="w-4 h-4" />
              <span className="text-[9px] leading-tight text-center">{t(link.nameKey)}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
