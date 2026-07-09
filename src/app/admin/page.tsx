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
  const [analytics, setAnalytics] = useState<{
    monthlyRevenue: { month: string; revenue: number }[];
    statusBreakdown: { name: string; value: number }[];
    topProducts: { name: string; quantity: number; revenue: number }[];
    customerGrowth: { month: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((products) => {
        fetch("/api/admin/orders")
          .then((res) => res.json())
          .then(async (orders) => {
            const catRes = await fetch("/api/admin/categories");
            const categories = await catRes.json();
            const analyticsRes = await fetch("/api/admin/analytics");
            const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

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
      label: "สินค้าทั้งหมด",
      value: stats?.totalProducts || 0,
      icon: HiOutlineCube,
      color: "bg-blue-500",
      href: "/admin/products",
    },
    {
      label: "ออเดอร์ทั้งหมด",
      value: stats?.totalOrders || 0,
      icon: HiOutlineShoppingBag,
      color: "bg-green-500",
      href: "/admin/orders",
    },
    {
      label: "ลูกค้า",
      value: stats?.totalCustomers || 0,
      icon: HiOutlineUsers,
      color: "bg-purple-500",
      href: "#",
    },
    {
      label: "หมวดหมู่",
      value: stats?.totalCategories || 0,
      icon: HiOutlineCollection,
      color: "bg-amber-500",
      href: "/admin/categories",
    },
    {
      label: "รายได้รวม",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: HiOutlineCurrencyDollar,
      color: "bg-emerald-600",
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-800 mb-6">
        ภาพรวม
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-gray-800">
            ออเดอร์ล่าสุด
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-gold-600 hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">ออเดอร์</th>
                <th className="pb-3 font-medium">ลูกค้า</th>
                <th className="pb-3 font-medium">ยอดรวม</th>
                <th className="pb-3 font-medium">สถานะ</th>
                <th className="pb-3 font-medium">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-gold-600 hover:underline font-mono text-xs"
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
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "shipping"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status === "pending"
                        ? "รอดำเนินการ"
                        : order.status === "confirmed"
                        ? "ยืนยันแล้ว"
                        : order.status === "shipping"
                        ? "กำลังจัดส่ง"
                        : order.status === "delivered"
                        ? "จัดส่งแล้ว"
                        : order.status === "cancelled"
                        ? "ยกเลิก"
                        : order.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    ยังไม่มีออเดอร์
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">รายได้รายเดือน</h2>
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

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">สถานะออเดอร์</h2>
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">สินค้าขายดี</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number | string) => [Number(value), "จำนวนที่ขาย"]} />
                    <Bar dataKey="quantity" fill="#b8860b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">การเติบโตของลูกค้า</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number | string) => [Number(value), "ลูกค้าสะสม"]} />
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
