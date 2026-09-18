"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  FileText,
  Image as ImageIcon,
  Settings,
  Star,
  Tag,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import { useAuth } from "@/lib/auth-context";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderOpen },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Content", href: "/admin/content", icon: FileText },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-cream text-taupe flex flex-col">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-taupe/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar (w-64, hidden on mobile, shown via toggle) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-sand flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-sand">
            <div>
              <Link
                href="/admin"
                className="font-serif text-2xl tracking-wider text-taupe block leading-tight hover:text-gold transition-colors"
              >
                ALSayyedah
              </Link>
              <span className="text-xs font-semibold tracking-widest text-gold uppercase">
                Admin
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-taupe/70 hover:text-taupe md:hidden rounded hover:bg-beige"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-beige text-taupe font-semibold shadow-xs"
                      : "text-taupe/70 hover:bg-beige"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-gold" : "text-taupe/60"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info at bottom of sidebar */}
          <div className="p-4 border-t border-sand bg-cream/40">
            <div className="text-xs text-taupe/70">Logged in as</div>
            <div className="text-xs font-semibold text-taupe truncate">
              {user?.email || "Admin User"}
            </div>
          </div>
        </aside>

        {/* Main Section */}
        <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-sand px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-taupe hover:text-gold md:hidden focus:outline-none rounded hover:bg-beige transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="hidden sm:inline-block font-serif text-lg text-taupe font-medium">
                Admin Console
              </span>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-taupe hover:text-gold border border-sand rounded-md hover:bg-beige transition-colors"
              >
                <span>View Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-taupe/70" />
              </Link>

              <button
                onClick={() => logout()}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-taupe/80 hover:text-red-700 rounded-md hover:bg-beige transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 p-8 bg-cream">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
