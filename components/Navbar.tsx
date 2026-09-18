"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [currentQuery, setCurrentQuery] = useState("");

  const { user, role, logout } = useAuth();
  const totalItems = useCart((s) => s.totalItems());
  const totalWishlistItems = useWishlist((s) => s.totalItems());

  const isAdmin = role === "ADMIN" || (user as { role?: string } | null)?.role === "ADMIN";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update query on navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentQuery(window.location.search);
    }
  }, [pathname]);

  // Scroll listener for subtle shadow after 20px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = mounted ? totalItems : 0;
  const wishlistCount = mounted ? totalWishlistItems : 0;

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Abaya", href: "/shop?c=abaya" },
    { label: "Burkha", href: "/shop?c=burkha" },
    { label: "Niqab", href: "/shop?c=niqab" },
    { label: "Hijab", href: "/shop?c=hijab" },
    { label: "About", href: "/about" },
  ];

  const isLinkActive = (href: string) => {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      return pathname === path && currentQuery.includes(query);
    }
    if (href === "/shop") {
      return pathname === "/shop" && (!currentQuery || !currentQuery.includes("c="));
    }
    return pathname === href;
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-sand transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="font-serif text-2xl md:text-3xl tracking-wide text-taupe hover:text-gold transition-colors duration-300 select-none"
            >
              ALSayyedah
            </Link>
          </div>

          {/* Center: Desktop Nav Links with Animated Underline */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 text-sm font-medium tracking-wide group transition-colors duration-300 ${
                    active ? "text-gold" : "text-taupe hover:text-gold"
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Animated underline */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full transition-transform duration-300 origin-left ${
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* a) Search Icon */}
            <SearchBar />

            {/* b) Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-beige rounded-full text-taupe hover:text-gold transition-all duration-200 group flex items-center justify-center"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* c) Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-beige rounded-full text-taupe hover:text-gold transition-all duration-200 group flex items-center justify-center"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* d & e & f) User / Admin / Auth Section */}
            <div className="hidden sm:flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2 text-sm text-taupe">
                  {/* d) Admin badge */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="bg-gold text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider hover:bg-gold/90 transition-colors shadow-xs uppercase mr-1"
                      title="Admin Panel"
                    >
                      ADMIN
                    </Link>
                  )}

                  {/* e) User Icon */}
                  <Link
                    href="/account"
                    className="p-2 hover:bg-beige rounded-full text-taupe hover:text-gold transition-all duration-200 group flex items-center justify-center"
                    title="My Account"
                    aria-label="My Account"
                  >
                    <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  </Link>

                  {/* f) Logout Icon */}
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="p-2 hover:bg-beige rounded-full text-taupe hover:text-red-500 transition-all duration-200 cursor-pointer flex items-center justify-center group"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-taupe text-cream px-4 py-2 rounded-md hover:bg-gold transition-all duration-300 text-xs font-medium uppercase tracking-wider font-sans shadow-xs hover:shadow-sm inline-flex items-center justify-center"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-beige rounded-full text-taupe hover:text-gold transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 transition-transform duration-200" />
                ) : (
                  <Menu className="w-6 h-6 transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Animated Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden md:hidden border-t border-sand bg-cream/95 backdrop-blur-md"
          >
            <nav className="flex flex-col">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-6 text-sm font-medium tracking-wide border-b border-sand/50 transition-colors flex items-center justify-between ${
                      active
                        ? "bg-beige text-gold font-semibold"
                        : "text-taupe hover:bg-beige/60 hover:text-gold"
                    }`}
                  >
                    <span>{link.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                  </Link>
                );
              })}

              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-6 text-sm font-medium tracking-wide border-b border-sand/50 transition-colors flex items-center justify-between ${
                  pathname === "/wishlist"
                    ? "bg-beige text-gold font-semibold"
                    : "text-taupe hover:bg-beige/60 hover:text-gold"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </nav>

            <div className="p-4 bg-beige/40 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="bg-gold text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase"
                      >
                        ADMIN
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-gold transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <span>Logout</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-taupe text-cream py-2.5 rounded-md text-xs font-medium uppercase tracking-wider text-center hover:bg-gold transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
