"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineSearch, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { useLanguage } from "@/context/LanguageContext";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { orders: number; reviews: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useLanguage();

  const fetchCustomers = (page: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", page.toString());
    params.set("limit", "20");

    fetch(`/api/admin/customers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.users || []);
        setTotalPages(data.totalPages);
        setCurrentPage(data.page);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchCustomers(page);
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
        {t("admin.manageCustomers")}
      </h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.search")}
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary text-sm py-2 px-4">
          {t("admin.search")}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t("admin.noData")}</div>
      ) : (
        <>
          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">{t("customer.name")}</th>
                    <th className="px-4 py-3 font-medium">{t("customer.email")}</th>
                    <th className="px-4 py-3 font-medium">{t("customer.role")}</th>
                    <th className="px-4 py-3 font-medium">{t("customer.totalOrders")}</th>
                    <th className="px-4 py-3 font-medium">{t("customer.totalReviews")}</th>
                    <th className="px-4 py-3 font-medium">{t("customer.registeredDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => window.location.href = `/admin/customers/${customer.id}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                        {customer.name || t("customer.name")}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.role === "superadmin"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                            : customer.role === "admin"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}>
                          {customer.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{customer._count.orders}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{customer._count.reviews}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {new Date(customer.createdAt).toLocaleDateString("th-TH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sm:hidden space-y-3">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {customer.name || t("customer.name")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{customer.email}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{t("customer.totalOrders")} {customer._count.orders}</span>
                  <span>{t("customer.totalReviews")} {customer._count.reviews}</span>
                  <span>{new Date(customer.createdAt).toLocaleDateString("th-TH")}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-gold-600 text-white"
                      : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:text-gold-700 dark:hover:text-gold-400 transition-colors dark:text-gray-300"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
