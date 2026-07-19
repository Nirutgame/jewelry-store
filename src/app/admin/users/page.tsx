"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/Toast";
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineTrash, HiOutlineKey, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlus } from "react-icons/hi";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { t, locale } = useLanguage();
  const { addToast } = useToast();

  const fetchUsers = (page: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", page.toString());
    params.set("limit", "20");

    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => { setUsers(data.users || []); setTotalPages(data.totalPages || 1); setCurrentPage(data.page || 1); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(1); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(1); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createForm.password.length < 6) { addToast("รหัสผ่านต้องมีอย่างน้อย 6 ตัว", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("เพิ่มผู้ใช้สำเร็จ", "success");
        setShowCreate(false);
        setCreateForm({ name: "", email: "", password: "", role: "customer" });
        fetchUsers(1);
      } else {
        addToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch { addToast("เกิดข้อผิดพลาด", "error"); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editUser) return;
    if (editPassword && editPassword.length < 6) { addToast("รหัสผ่านต้องมีอย่างน้อย 6 ตัว", "error"); return; }
    if (editPassword && editPassword !== editConfirmPassword) { addToast("รหัสผ่านไม่ตรงกัน", "error"); return; }
    setSaving(true);
    try {
      const body: Record<string, string> = { role: editRole };
      if (editPassword) body.password = editPassword;
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("อัปเดตผู้ใช้สำเร็จ", "success");
        setEditUser(null);
        setEditPassword("");
        setEditConfirmPassword("");
        fetchUsers(currentPage);
      } else {
        addToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch { addToast("เกิดข้อผิดพลาด", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(locale === "en" ? `Delete "${user.email}"?` : `ลบ "${user.email}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || "ลบสำเร็จ", "success");
        fetchUsers(currentPage);
      } else {
        addToast(data.message || "ไม่สามารถลบได้", "error");
      }
    } catch { addToast("เกิดข้อผิดพลาด", "error"); }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
      admin: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
      customer: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || "bg-gray-100 text-gray-800"}`}>
        {role}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">
          {locale === "en" ? "User Management" : "จัดการผู้ใช้"}
        </h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> {locale === "en" ? "Add User" : "เพิ่มผู้ใช้"}
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={locale === "en" ? "Search email or name" : "ค้นหาอีเมลหรือชื่อ"} className="input-field pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); fetchUsers(1); }} className="input-field w-auto">
          <option value="">{locale === "en" ? "All Roles" : "ทุกบทบาท"}</option>
          <option value="superadmin">superadmin</option>
          <option value="admin">admin</option>
          <option value="customer">customer</option>
        </select>
        <button type="submit" className="btn-primary text-sm py-2 px-4">{t("admin.search")}</button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t("admin.noData")}</div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">{locale === "en" ? "Name" : "ชื่อ"}</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">{locale === "en" ? "Role" : "บทบาท"}</th>
                    <th className="px-4 py-3 font-medium">{locale === "en" ? "Registered" : "ลงทะเบียน"}</th>
                    <th className="px-4 py-3 font-medium">{t("admin.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{user.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">{roleBadge(user.role)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString("th-TH")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditUser(user); setEditRole(user.role); setEditPassword(""); setEditConfirmPassword(""); }} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title={t("admin.edit")}>
                            <HiOutlineShieldCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title={t("admin.delete")}>
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button onClick={() => fetchUsers(currentPage - 1)} disabled={currentPage <= 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 transition-colors dark:text-gray-300">
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => fetchUsers(p)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? "bg-gold-600 text-white" : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => fetchUsers(currentPage + 1)} disabled={currentPage >= totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 transition-colors dark:text-gray-300">
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {locale === "en" ? "Add User" : "เพิ่มผู้ใช้"}
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("customer.name")}</label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="input-field" placeholder={t("customer.name")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="input-field" placeholder="email@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{locale === "en" ? "Role" : "บทบาท"}</label>
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="input-field">
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t("auth.password")}</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="input-field" placeholder="********" minLength={6} required />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? t("common.loading") : t("admin.save")}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">{t("admin.cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">
              {locale === "en" ? "Edit User" : "แก้ไขผู้ใช้"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{editUser.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{locale === "en" ? "Role" : "บทบาท"}</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="input-field">
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  <HiOutlineKey className="w-4 h-4 inline mr-1" />{locale === "en" ? "New Password (leave blank to keep)" : "รหัสผ่านใหม่ (เว้นว่างไว้ไม่เปลี่ยน)"}
                </label>
                <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="input-field" placeholder="********" minLength={6} />
              </div>
              {editPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{locale === "en" ? "Confirm Password" : "ยืนยันรหัสผ่าน"}</label>
                  <input type="password" value={editConfirmPassword} onChange={(e) => setEditConfirmPassword(e.target.value)} className="input-field" placeholder="********" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEdit} disabled={saving} className="btn-primary">{saving ? t("common.loading") : t("admin.save")}</button>
              <button onClick={() => setEditUser(null)} className="btn-secondary">{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
