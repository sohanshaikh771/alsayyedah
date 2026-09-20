"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto px-4 py-16 sm:py-24 w-full text-center flex flex-col items-center justify-center">
        {/* Big gold checkmark */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gold/15 text-gold border-2 border-gold/40 mb-6 shadow-sm">
          <CheckCircle2 className="w-14 h-14" />
        </div>

        {/* Order Sent to WhatsApp! (serif 4xl) */}
        <h1 className="font-serif text-4xl sm:text-5xl text-taupe font-medium mb-2">
          Order Sent to WhatsApp!
        </h1>

        <p className="font-amiri text-3xl text-gold/80 text-center mt-2" dir="rtl">
          شكراً جزيلاً
        </p>
        <p className="text-center text-taupe/70 text-sm mt-1 mb-6">
          (Thank you so much)
        </p>

        {/* Subtext info */}
        <div className="space-y-2 max-w-md mx-auto mb-10 text-taupe/80 text-base leading-relaxed">
          <p className="font-medium text-taupe">
            Please send the WhatsApp message to confirm your order.
          </p>
          <p className="text-sm text-taupe/70">
            We&apos;ll contact you shortly to confirm delivery details and dispatch your package.
          </p>
        </div>

        {/* Buttons: "Continue Shopping" → /shop, "View My Orders" → /account */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm">
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 bg-taupe text-cream px-6 py-3.5 rounded-md text-sm font-medium hover:bg-gold transition shadow-xs cursor-pointer text-center"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          <Link
            href="/account"
            className="w-full inline-flex items-center justify-center gap-2 border border-taupe text-taupe px-6 py-3.5 rounded-md text-sm font-medium hover:bg-taupe hover:text-cream transition cursor-pointer text-center"
          >
            <span>View My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
