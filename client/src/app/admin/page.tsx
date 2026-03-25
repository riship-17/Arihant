/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    itemsCount: 0,
    lowStock: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const itemsRes = await api.get("/uniform-items");
        
        const lowStock = itemsRes.data.filter((p: any) => p.sizes.some((s: any) => s.stock < 10)).length;

        setStats({
          totalOrders: 0,
          revenue: 0,
          itemsCount: itemsRes.data.length,
          lowStock
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Revenue", value: `₹${stats.revenue}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { title: "Uniform Items", value: stats.itemsCount, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Low Stock Alerts", value: stats.lowStock, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-heading text-brand-secondary mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shadow-black/5">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                   <TrendingUp size={12} /> +12%
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-1">{card.title}</div>
              <div className="text-2xl font-bold text-brand-secondary">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-heading text-brand-secondary mb-6">Recent Orders</h2>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">No recent orders found.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-heading text-brand-secondary mb-6">Sales Activity</h2>
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
            <Package size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm">Charts & Analytics Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
