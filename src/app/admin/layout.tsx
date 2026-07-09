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
} from "react-icons/hi";

const sidebarLinks = [
  { name: "ภาพรวม", href: "/admin", icon: HiOutlineViewGrid },
  { name: "สินค้า", href: "/admin/products", icon: HiOutlineCube },
  { name: "ออเดอร์", href: "/admin/orders", icon: HiOutlineShoppingBag },
  { name: "หมวดหมู่", href: "/admin/categories", icon: HiOutlineCollection },
  { name: "ส่วนลด", href: "/admin/promocodes", icon: HiOutlineTag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
            ไม่มีสิทธิ์เข้าถึง
          </h2>
          <p className="text-gray-500 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          <Link href="/" className="btn-primary">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm hidden md:block">
        <div className="p-6 border-b">
          <Link href="/admin" className="text-2xl font-serif font-bold text-gold-700">
            Admin Panel
          </Link>
          <p className="text-xs text-gray-400 mt-1">Lumière Jewelry</p>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-colors"
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
          <hr className="my-4" />
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span className="font-medium">กลับหน้าร้าน</span>
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between md:hidden">
          <Link href="/admin" className="text-xl font-serif font-bold text-gold-700">
            Admin Panel
          </Link>
          <Link href="/" className="text-sm text-gray-500">
            หน้าร้าน
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex md:hidden justify-around items-center z-50 px-2 py-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gold-700 transition-colors"
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px]">{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
