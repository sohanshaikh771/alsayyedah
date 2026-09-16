"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, Package, IndianRupee, Users, Loader2 } from "lucide-react";
import { getDashboardStats, DashboardStats } from "@/lib/admin-stats";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="font-serif text-3xl text-taupe tracking-tight">Dashboard</h1>
          <p className="text-sm text-taupe/70 mt-1">
            Welcome to ALSayyedah Admin Panel
          </p>
        </div>

        <div className="bg-white border border-sand rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
          <p className="text-taupe font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: (stats?.totalOrders ?? 0).toString(),
      subtext: `Pending: ${stats?.pendingOrders ?? 0}`,
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: (stats?.totalProducts ?? 0).toString(),
      subtext: "Live catalog items",
      icon: Package,
    },
    {
      title: "Revenue",
      value: `₹${(stats?.revenue ?? 0).toLocaleString("en-IN")}`,
      subtext: "Delivered & confirmed",
      icon: IndianRupee,
    },
    {
      title: "Customers",
      value: (stats?.totalCustomers ?? 0).toString(),
      subtext: "Registered accounts",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl text-taupe tracking-tight">Dashboard</h1>
        <p className="text-sm text-taupe/70 mt-1">
          Welcome to ALSayyedah Admin Panel
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white border border-sand rounded-xl p-6 shadow-xs hover:border-gold/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-taupe/60">
                  {stat.title}
                </span>
                <div className="w-10 h-10 rounded-lg bg-beige flex items-center justify-center text-gold">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="font-serif text-2xl sm:text-3xl text-taupe font-semibold">
                  {stat.value}
                </p>
                <p className="text-xs text-taupe/60 mt-1">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Overview Activity Section */}
      <div className="bg-white border border-sand rounded-xl p-6 sm:p-8 shadow-xs">
        <h2 className="font-serif text-xl text-taupe mb-2">Recent Activity</h2>
        <p className="text-sm text-taupe/70">
          This is your central admin overview. Real-time metrics for products, orders, and
          customers are synced directly with Firestore.
        </p>
      </div>
    </div>
  );
}
