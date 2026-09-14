import React from "react";
import { ShoppingCart, Package, IndianRupee, Users } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard — ALSayyedah",
};

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Orders",
      value: "128",
      subtext: "+12% from last month",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: "24",
      subtext: "Across 4 categories",
      icon: Package,
    },
    {
      title: "Revenue",
      value: "₹1,42,850",
      subtext: "+18.4% from last month",
      icon: IndianRupee,
    },
    {
      title: "Customers",
      value: "86",
      subtext: "+8 new this week",
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
        {stats.map((stat) => {
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

      {/* Dashboard Overview Placeholder */}
      <div className="bg-white border border-sand rounded-xl p-6 sm:p-8 shadow-xs">
        <h2 className="font-serif text-xl text-taupe mb-2">Recent Activity</h2>
        <p className="text-sm text-taupe/70">
          This is your central admin overview. As you manage products, orders, banners,
          and content, realtime metrics and administrative actions will appear here.
        </p>
      </div>
    </div>
  );
}
