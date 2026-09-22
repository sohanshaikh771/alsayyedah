"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Heart, Truck, Check, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import FeaturedProductsClient from "@/components/FeaturedProductsClient";
import CategoryGrid from "@/components/CategoryGrid";
import BrandStorySlider from "@/components/BrandStorySlider";
import HeroImageSlider from "@/components/HeroImageSlider";
import { Product } from "@/lib/products-firestore";
import { SiteContent, defaultContent } from "@/lib/content-firestore";
import { BRAND } from "@/lib/constants";
import { fadeInUp, staggerContainer, slideInLeft, slideInRight } from "@/lib/animations";

interface HomeClientProps {
  initialProducts?: Product[];
  content?: SiteContent;
}

export default function HomeClient({
  initialProducts = [],
  content = defaultContent,
}: HomeClientProps) {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION (Mobile Full-Width vs Desktop Two-Column) */}
        <section className="relative bg-gradient-to-b from-cream to-beige border-b border-sand/40">

          {/* ============ MOBILE VERSION (below lg) ============ */}
          <div className="lg:hidden relative min-h-[80vh] flex items-center overflow-hidden">
            {/* Background image */}
            {content.heroImages && content.heroImages.length > 0 ? (
              <div className="absolute inset-0 z-0">
                <HeroImageSlider images={content.heroImages} fillMode />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-beige via-cream to-sand" />
            )}

            {/* Text overlay */}
            <div className="relative z-10 px-6 py-16 w-full">
              <div className="max-w-md">
                <p className="text-xs tracking-[0.3em] text-gold uppercase mb-4 font-sans font-semibold">
                  {content.heroLabel || "MODEST FASHION"}
                </p>
                <h1 className="font-serif text-4xl leading-tight whitespace-pre-line text-cream drop-shadow-lg">
                  {content.heroHeading || "Your Modest\nIdentity"}
                </h1>
                <p className="mt-4 text-cream/90 text-base leading-relaxed font-sans">
                  {content.heroSubtext}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/shop"
                    className="bg-cream text-taupe text-center px-6 py-3 rounded-md font-medium shadow-md hover:bg-gold hover:text-cream transition-all duration-300"
                  >
                    Shop Now
                  </Link>
                  <a
                    href={BRAND.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-cream text-cream text-center px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-cream hover:text-taupe transition-all duration-300 select-none"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Order on WhatsApp</span>
                  </a>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 text-cream/80 text-xs font-sans">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-gold" /> Free Shipping above ₹1999
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-gold" /> COD Available
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-gold" /> Saudi & Korean Silks
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============ DESKTOP VERSION (lg and above) ============ */}
          <div className="hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 py-20">
              <div className="grid grid-cols-2 gap-16 items-center">

                {/* LEFT — Text */}
                <div>
                  <p className="text-xs tracking-[0.3em] text-gold uppercase mb-4 font-sans font-semibold">
                    {content.heroLabel || "MODEST FASHION"}
                  </p>
                  <h1 className="font-serif text-6xl text-taupe leading-tight whitespace-pre-line">
                    {content.heroHeading || "Your Modest\nIdentity"}
                  </h1>
                  <p className="mt-5 text-taupe/70 text-lg max-w-md leading-relaxed font-sans">
                    {content.heroSubtext}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/shop"
                      className="bg-taupe text-cream px-8 py-4 rounded-md hover:bg-gold transition-all duration-300 font-medium shadow-md"
                    >
                      Shop Now
                    </Link>
                    <a
                      href={BRAND.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-taupe text-taupe px-8 py-4 rounded-md hover:bg-taupe hover:text-cream transition-all duration-300 flex items-center gap-2 font-medium select-none"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>Order on WhatsApp</span>
                    </a>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-4 text-taupe/60 text-sm font-sans">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      Free Shipping above ₹1999
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      COD Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      Saudi & Korean Silks
                    </span>
                  </div>
                </div>

                {/* RIGHT — Image */}
                <div>
                  {content.heroImages && content.heroImages.length > 0 ? (
                    <HeroImageSlider images={content.heroImages} />
                  ) : (
                    <div className="aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-br from-sand to-beige shadow-xl flex items-center justify-center">
                      <p className="font-italiana text-3xl text-taupe/30 tracking-wider">
                        ALSayyedah
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* 2. CATEGORIES SECTION */}
        <CategoryGrid />

        {/* 3. FEATURED PRODUCTS SECTION */}
        <FeaturedProductsClient
          initialProducts={initialProducts}
          title={content.featuredTitle}
        />


        {/* 4. BRAND STORY SECTION */}
        <section className="w-full bg-cream border-y border-sand/40 py-10 sm:py-16 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* LEFT COLUMN (visual) */}
              <motion.div
                variants={slideInLeft}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.25 }}
                className="w-full flex justify-center"
              >
                {content.storyImages && content.storyImages.length > 0 ? (
                  <BrandStorySlider images={content.storyImages} />
                ) : (
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-full max-w-lg aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden border border-sand/50 shadow-xl bg-gradient-to-br from-sand via-beige to-sand/90 p-8 flex flex-col justify-between select-none"
                  >
                    {/* Large decorative serif letter "A" centered watermark */}
                    <span className="absolute inset-0 flex items-center justify-center font-serif text-[12rem] font-bold text-taupe/10 select-none pointer-events-none">
                      A
                    </span>

                    {/* Thin gold circle outline (absolute top-8 right-8, w-32 h-32) */}
                    <div className="absolute top-8 right-8 w-32 h-32 border border-gold/30 rounded-full pointer-events-none" />

                    {/* Small dots pattern (CSS radial gradient) at bottom-left */}
                    <div
                      className="absolute bottom-6 left-6 w-36 h-36 opacity-25 pointer-events-none"
                      style={{
                        backgroundImage: "radial-gradient(#6B5B4E 1.2px, transparent 1.2px)",
                        backgroundSize: "14px 14px",
                      }}
                    />

                    {/* Inner luxury seal & frame */}
                    <div className="relative z-10 w-full h-full border border-gold/25 rounded-xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-[1px] bg-cream/15">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] tracking-[0.3em] uppercase text-taupe/60 font-semibold font-sans">
                          Artisan Islamic Wear
                        </span>
                        <Sparkles className="w-4 h-4 text-gold" />
                      </div>

                      <div className="my-auto text-center space-y-2 py-8">
                        <span className="font-serif text-3xl sm:text-4xl text-taupe/85 tracking-widest uppercase block font-semibold">
                          ALSAYYEDAH
                        </span>
                        <p className="font-serif text-sm italic text-taupe/60">
                          {content.storyTagline || "Your Modest Identity"}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gold/20 flex items-center justify-between text-[11px] text-taupe/60 font-sans">
                        <span>Heritage & Modesty</span>
                        <span className="text-gold font-medium">Delivered Across India</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* RIGHT COLUMN (content) */}
              <motion.div
                variants={slideInRight}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.25 }}
                className="flex flex-col justify-center text-left"
              >
                {/* Small label: "OUR STORY" (gold, text-xs, tracking-[0.3em], uppercase) */}
                <span className="text-gold text-xs tracking-[0.3em] uppercase font-semibold block font-sans">
                  {content.storyLabel || "OUR STORY"}
                </span>

                {/* Heading: "ALSayyedah" (serif 5xl taupe, mt-2) */}
                <h2 className="font-serif text-4xl sm:text-5xl text-taupe mt-2 tracking-tight">
                  {content.storyHeading || "ALSayyedah"}
                </h2>

                {/* Tagline: "Your Modest Identity" (gold, italic serif lg, mt-2) */}
                <p className="text-gold font-serif italic text-lg sm:text-xl mt-2">
                  {content.storyTagline || "Your Modest Identity"}
                </p>

                {/* Paragraph 1: existing text (taupe/80, leading-relaxed, mt-6) */}
                <p className="text-taupe/80 font-sans leading-relaxed text-sm sm:text-base mt-6">
                  {content.storyParagraph1}
                </p>

                {/* Paragraph 2: existing text (taupe/80, leading-relaxed, mt-4) */}
                <p className="text-taupe/80 font-sans leading-relaxed text-sm sm:text-base mt-4">
                  {content.storyParagraph2}
                </p>

                {/* Divider line (w-16 h-0.5 bg-gold mt-8) */}
                <div className="w-16 h-0.5 bg-gold mt-8 rounded-full" />

                {/* Small stat row (flex gap-8 mt-8): Handcrafted + Premium + Delivered */}
                <div className="flex gap-6 sm:gap-8 mt-8 flex-wrap">
                  <div className="space-y-1.5">
                    <Heart className="w-5 h-5 text-gold" />
                    <div className="text-taupe font-serif text-sm sm:text-base font-semibold leading-tight">
                      Handcrafted
                    </div>
                    <div className="text-xs text-taupe/60 font-sans">with Love</div>
                  </div>

                  <div className="space-y-1.5">
                    <Sparkles className="w-5 h-5 text-gold" />
                    <div className="text-taupe font-serif text-sm sm:text-base font-semibold leading-tight">
                      Premium
                    </div>
                    <div className="text-xs text-taupe/60 font-sans">Fabrics</div>
                  </div>

                  <div className="space-y-1.5">
                    <Truck className="w-5 h-5 text-gold" />
                    <div className="text-taupe font-serif text-sm sm:text-base font-semibold leading-tight">
                      Delivered
                    </div>
                    <div className="text-xs text-taupe/60 font-sans">Across India</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. NEWSLETTER SIGNUP */}
        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  );
}
