import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products-data";
import { BRAND } from "@/lib/constants";

export default function Home() {
  const featuredProducts = products.filter((p) => p.featured);

  const categories = [
    { name: "Abaya", slug: "abaya" },
    { name: "Burkha", slug: "burkha" },
    { name: "Niqab", slug: "niqab" },
    { name: "Hijab", slug: "hijab" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="w-full bg-beige py-24 md:py-32 border-b border-sand/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="inline-block text-xs md:text-sm font-semibold tracking-widest text-gold uppercase">
              Modest Fashion
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-taupe leading-tight whitespace-pre-line tracking-tight">
              {"Your Modest\nIdentity"}
            </h1>

            <p className="text-base sm:text-lg text-taupe/70 max-w-xl mx-auto font-sans leading-relaxed">
              Premium Burkha, Abaya, Niqab & Hijab — handcrafted with love,
              delivered across India.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-taupe text-cream px-8 py-3 rounded-md font-sans text-sm font-medium tracking-wide shadow-sm hover:bg-taupe/90 transition-colors"
              >
                Shop Now
              </Link>

              <a
                href={BRAND.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-taupe text-taupe px-8 py-3 rounded-md font-sans text-sm font-medium tracking-wide hover:bg-taupe/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. CATEGORIES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-taupe text-center mb-10 tracking-wide">
            Shop by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?c=${cat.slug}`}
                className="group relative aspect-square flex flex-col items-center justify-center bg-beige border border-sand rounded-md p-6 text-center transition-all duration-300 hover:bg-sand/60 hover:-translate-y-1 hover:shadow-sm"
              >
                <span className="font-serif text-2xl sm:text-3xl text-taupe group-hover:text-gold transition-colors tracking-wide">
                  {cat.name}
                </span>

                <span className="w-8 h-0.5 bg-gold my-3 rounded-full group-hover:w-12 transition-all duration-300" />

                <span className="text-xs uppercase tracking-widest text-taupe/60 font-sans group-hover:text-taupe transition-colors">
                  View Collection
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-sand/40">
          <h2 className="font-serif text-3xl sm:text-4xl text-taupe text-center mb-10 tracking-wide">
            Featured Products
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-block text-taupe font-sans text-sm font-semibold tracking-wide underline underline-offset-8 hover:text-gold transition-colors"
            >
              View All Products
            </Link>
          </div>
        </section>

        {/* 4. BRAND STORY SECTION */}
        <section className="bg-beige border-y border-sand/40 py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              Our Story
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl text-taupe tracking-wide">
              ALSayyedah
            </h2>

            <div className="space-y-4 text-taupe/80 font-sans leading-relaxed text-sm sm:text-base">
              <p>
                At ALSayyedah, modesty and elegance exist in graceful harmony.
                Inspired by timeless Islamic heritage, each garment is designed to
                celebrate your personal expression of faith with quiet luxury and
                uncompromising dignity.
              </p>
              <p>
                From hand-selected breathable Saudi Crepe and Korean Nida fabrics to
                impeccably tailored cuts, we pour artisan craftsmanship into every
                stitch. Designed for comfort and lasting grace, delivered straight
                to your doorstep across India.
              </p>
            </div>

            <p className="font-serif text-2xl sm:text-3xl text-gold pt-4 tracking-wider italic">
              Your Modest Identity
            </p>
          </div>
        </section>

        {/* 5. NEWSLETTER / INSTAGRAM CTA SECTION */}
        <section className="py-16 px-4 sm:px-6 bg-cream text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="font-serif text-2xl sm:text-3xl text-taupe">
              Follow us on Instagram {BRAND.instagramHandle}
            </h3>
            <p className="text-sm text-taupe/70 font-sans">
              Stay inspired with our latest modest couture collections, styling guides,
              and exclusive community updates.
            </p>
            <div className="pt-2">
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-taupe text-cream rounded-md text-sm font-medium tracking-wide hover:bg-taupe/90 transition-colors shadow-sm"
              >
                <FaInstagram className="w-4 h-4" />
                <span>Follow {BRAND.instagramHandle}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
