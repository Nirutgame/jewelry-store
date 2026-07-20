"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
