import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Heart, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Our Story — ALSayyedah",
  description:
    "Discover the heritage and craftsmanship behind ALSayyedah. Handcrafted modest fashion celebrating elegance, dignity, and faith.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="text-center">
            <p className="font-amiri text-4xl md:text-5xl text-gold/80 mb-4" dir="rtl">
              السيدة
            </p>
            <h1 className="font-italiana text-4xl md:text-6xl text-taupe tracking-[0.15em]">
              ALSayyedah
            </h1>
            <p className="font-serif italic text-taupe/70 text-lg mt-3">
              Your Modest Identity
            </p>
          </div>

          <div className="w-16 h-0.5 bg-gold/40 mx-auto my-8" />

          <p className="font-sans text-base sm:text-lg text-taupe/80 leading-relaxed max-w-2xl mx-auto">
            Born from a deep reverence for modest elegance, ALSayyedah creates silhouettes 
            that honor tradition while embracing contemporary grace. We believe modesty is 
            not a compromise — it is an expression of dignity, quiet luxury, and identity.
          </p>
        </section>

        {/* Brand Values */}
        <section className="bg-beige/60 py-16 px-4 sm:px-6 lg:px-8 border-y border-sand/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cream p-8 rounded-xl border border-sand/60 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-sand/40 border border-sand flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-taupe font-medium mb-2">
                Artisanal Fabrics
              </h3>
              <p className="font-sans text-sm text-taupe/70 leading-relaxed">
                Imported Korean Nida, Saudi Crepe, and ethereal Chiffon selected for breathable comfort, graceful drape, and longevity.
              </p>
            </div>

            <div className="bg-cream p-8 rounded-xl border border-sand/60 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-sand/40 border border-sand flex items-center justify-center mx-auto mb-5">
                <Heart className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-taupe font-medium mb-2">
                Crafted With Love
              </h3>
              <p className="font-sans text-sm text-taupe/70 leading-relaxed">
                Every piece is tailored with meticulous attention to stitching, hemwork, and subtle embroidery by skilled artisans.
              </p>
            </div>

            <div className="bg-cream p-8 rounded-xl border border-sand/60 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-sand/40 border border-sand flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-taupe font-medium mb-2">
                Pan-India Delivery
              </h3>
              <p className="font-sans text-sm text-taupe/70 leading-relaxed">
                Discreet and swift courier shipping to every pincode across India, complete with Cash on Delivery and easy support.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-taupe font-medium mb-4">
            Discover the Collection
          </h2>
          <p className="font-sans text-sm sm:text-base text-taupe/70 max-w-md mx-auto mb-8">
            Explore handcrafted Abayas, Burkhas, Niqabs, and Hijabs designed for your daily grace and special moments.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-taupe text-cream px-8 py-3.5 rounded-md text-sm font-medium hover:bg-gold transition-colors duration-300 shadow-md min-h-[44px]"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
