import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin" || role === "superadmin";
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === "superadmin";
}

export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function requireAdmin() {
  return requireRole(["admin", "superadmin"]);
}

export async function requireSuperAdmin() {
  return requireRole(["superadmin"]);
}
