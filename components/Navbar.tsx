"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, role, logout } = useAuth();
  const totalItems = useCart((s) => s.totalItems());

  const isAdmin = role === "ADMIN" || (user as { role?: string } | null)?.role === "ADMIN";

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? totalItems : 0;

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Abaya", href: "/shop?c=abaya" },
    { label: "Burkha", href: "/shop?c=burkha" },
    { label: "Niqab", href: "/shop?c=niqab" },
    { label: "Hijab", href: "/shop?c=hijab" },
    { label: "About", href: "/about" },
  ];

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "there";

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="font-serif text-2xl sm:text-3xl tracking-wider text-taupe hover:text-gold transition-colors"
            >
              ALSayyedah
            </Link>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-sm font-medium tracking-wide text-taupe hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Cart & Auth */}
          <div className="flex items-center space-x-5">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-taupe hover:text-gold transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-gold rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <div className="flex items-center space-x-3 text-sm text-taupe">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white bg-gold rounded hover:bg-gold/90 transition-colors shadow-xs"
                      title="Admin Panel"
                    >
                      Admin
                    </Link>
                  )}
                  <span className="font-medium">Hi, {firstName}</span>
                  <button
                    onClick={() => logout()}
                    className="p-1 text-taupe hover:text-gold transition-colors"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="font-sans text-sm font-medium tracking-wide text-taupe hover:text-gold transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-taupe hover:text-gold transition-colors focus:outline-none"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand bg-cream/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-base font-medium text-taupe hover:text-gold transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-sand/60 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full text-taupe">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Hi, {firstName}</span>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white bg-gold rounded hover:bg-gold/90 transition-colors shadow-xs"
                    >
                      Admin
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 text-sm text-taupe hover:text-gold transition-colors"
                >
                  <span>Logout</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-sm font-medium text-taupe hover:text-gold transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
