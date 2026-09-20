"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Search, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";

export default function TrackOrderPage() {
  const [orderInput, setOrderInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderInput.trim().replace(/^#?ALS/i, "");
    if (!cleanId) {
      setError("Please enter a valid Order ID");
      return;
    }
    router.push(`/account/orders/${cleanId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto px-4 py-10 sm:py-20 w-full text-center">
        <div className="w-14 h-14 rounded-full bg-sand/40 border border-sand/70 flex items-center justify-center mx-auto mb-6">
          <Package className="w-7 h-7 text-gold" />
        </div>

        <span className="text-gold text-xs tracking-[0.3em] uppercase font-semibold block font-sans">
          Order Tracking
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl text-taupe mt-2">
          Track Your Order
        </h1>

        <p className="text-taupe/70 font-sans text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed">
          Enter your Order ID (from your confirmation message or email) to view real-time delivery status.
        </p>

        <form onSubmit={handleTrack} className="mt-8 space-y-4 text-left">
          <div>
            <label
              htmlFor="orderId"
              className="block text-xs font-semibold uppercase tracking-wider text-taupe/70 mb-2"
            >
              Order ID
            </label>
            <div className="relative">
              <input
                id="orderId"
                type="text"
                value={orderInput}
                onChange={(e) => {
                  setOrderInput(e.target.value);
                  setError("");
                }}
                placeholder="e.g. ALS7A8B9C or 7A8B9C"
                className="w-full bg-beige border border-sand rounded-md px-4 py-3 text-base sm:text-sm text-taupe focus:outline-none focus:border-gold transition-colors font-sans pl-11 min-h-[48px]"
              />
              <Search className="w-5 h-5 text-taupe/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-taupe text-cream py-3.5 px-6 rounded-md font-medium text-sm hover:bg-gold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {user && (
          <div className="mt-8 pt-8 border-t border-sand/50 text-center">
            <p className="text-xs text-taupe/60 mb-2">Already signed in?</p>
            <Link
              href="/account"
              className="text-sm font-medium text-taupe hover:text-gold transition-colors underline underline-offset-4"
            >
              View all orders in your Account →
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
