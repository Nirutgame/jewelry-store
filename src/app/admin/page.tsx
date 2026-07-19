"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineCollection,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import { formatPrice } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalCategories: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    total: number;
    status: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<{
    monthlyRevenue: { month: string; revenue: number }[];
    statusBreakdown: { name: string; value: number }[];
    topProducts: { name: string; quantity: number; revenue: number }[];
    customerGrowth: { month: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((productsData) => {
        fetch("/api/admin/orders")
          .then((res) => res.json())
          .then(async (ordersData) => {
            const catRes = await fetch("/api/admin/categories");
            const categories = await catRes.json();
            const analyticsRes = await fetch("/api/admin/analytics");
            const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;
            const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
            const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);

            const totalRevenue = orders.reduce(
              (sum: number, o: { total: number }) => sum + o.total,
              0
            );

            const customerIds = new Set(orders.map((o: { userId: string }) => o.userId));

            setStats({
              totalProducts: products.length,
              totalOrders: orders.length,
              totalCustomers: customerIds.size || 0,
              totalCategories: categories.length,
              totalRevenue,
              recentOrders: orders.slice(0, 5),
            });
            setAnalytics(analyticsData);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600" />
      </div>
    );
  }

  const statCards = [
    {
      label: t("admin.totalProducts"),
      value: stats?.totalProducts || 0,
      icon: HiOutlineCube,
      color: "bg-blue-500",
      href: "/admin/products",
    },
    {
      label: t("admin.totalOrders"),
      value: stats?.totalOrders || 0,
      icon: HiOutlineShoppingBag,
      color: "bg-green-500",
      href: "/admin/orders",
    },
    {
      label: t("admin.totalCustomers"),
      value: stats?.totalCustomers || 0,
      icon: HiOutlineUsers,
      color: "bg-purple-500",
      href: "/admin/customers",
    },
    {
      label: t("admin.totalCategories"),
      value: stats?.totalCategories || 0,
      icon: HiOutlineCollection,
      color: "bg-amber-500",
      href: "/admin/categories",
    },
    {
      label: t("admin.totalRevenue"),
      value: formatPrice(stats?.totalRevenue || 0),
      icon: HiOutlineCurrencyDollar,
      color: "bg-emerald-600",
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
        {t("admin.dashboard")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100">
            {t("admin.recentOrders")}
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-gold-600 dark:text-gold-400 hover:underline"
          >
            {t("admin.viewAll")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-medium">{t("orders.orderId")}</th>
                <th className="pb-3 font-medium">{t("admin.customers")}</th>
                <th className="pb-3 font-medium">{t("orders.total")}</th>
                <th className="pb-3 font-medium">{t("orders.status")}</th>
                <th className="pb-3 font-medium">{t("orders.date")}</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders.map((order) => (
                <tr key={order.id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-gold-600 dark:text-gold-400 hover:underline font-mono text-xs"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-3">
                    {order.firstName} {order.lastName}
                  </td>
                  <td className="py-3 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                          : order.status === "confirmed"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                          : order.status === "shipping"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                          : order.status === "delivered"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                          : order.status === "cancelled"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {order.status === "pending"
                        ? t("orders.pending")
                        : order.status === "confirmed"
                        ? t("orders.confirmed")
                        : order.status === "shipping"
                        ? t("orders.shipping")
                        : order.status === "delivered"
                        ? t("orders.delivered")
                        : order.status === "cancelled"
                        ? t("orders.cancelled")
                        : order.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-gray-500">
                    {t("orders.noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {analytics && (
        <>
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("admin.totalRevenue")}</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#e0a800" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("orders.status")}</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {analytics.statusBreakdown.map((_, index) => {
                        const colors = ["#facc15", "#3b82f6", "#a855f7", "#22c55e", "#ef4444"];
                        return <Cell key={index} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("admin.products")}</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [Number(value), t("products.pieces")]} />
                    <Bar dataKey="quantity" fill="#b8860b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-gray-100 mb-4">{t("admin.customers")}</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [Number(value), t("admin.customers")]} />
                    <Bar dataKey="count" fill="#8b6914" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
