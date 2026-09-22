"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Heart, Truck, Check, MessageCircle, ChevronDown } from "lucide-react";
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
import {
  StoreSettings,
  defaultSettings,
  listenStoreSettings,
} from "@/lib/settings-firestore";
import { fadeInUp, staggerContainer, slideInLeft, slideInRight } from "@/lib/animations";

interface HomeClientProps {
  initialProducts?: Product[];
  content?: SiteContent;
}

export default function HomeClient({
  initialProducts = [],
  content = defaultContent,
}: HomeClientProps) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    const unsubscribe = listenStoreSettings((data) => setSettings(data));
    return () => unsubscribe();
  }, []);

  const waNumber = settings.whatsappNumber
    ? settings.whatsappNumber.replace(/[^0-9]/g, "")
    : BRAND.whatsapp;
  const whatsappLink = `https://wa.me/${waNumber}`;
  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative border-b border-sand/40">
          {/* ============ MOBILE + TABLET (< lg) ============ */}
          <div className="lg:hidden relative min-h-[85vh] flex items-center overflow-hidden">
            {/* BACKGROUND IMAGE & CINEMATIC OVERLAY */}
            {content.heroImages && content.heroImages.length > 0 ? (
              <div className="absolute inset-0 z-0">
                <HeroImageSlider images={content.heroImages} fillMode />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10 pointer-events-none" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-beige via-cream to-sand z-0" />
            )}

            {/* EDITORIAL CONTENT OVERLAY */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 w-full">
              <div className="max-w-xl text-left">
                {/* UPGRADE 1 & 2: Label with gold accents and wider tracking */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="w-8 h-[1px] bg-gold/70" />
                  <span className="text-[10px] md:text-xs font-semibold tracking-[0.4em] text-gold uppercase font-sans">
                    {content.heroLabel || "MODEST FASHION"}
                  </span>
                  <span className="w-8 h-[1px] bg-gold/70" />
                </motion.div>

                {/* UPGRADE 1 & 2: Big Serif Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="font-serif text-5xl md:text-6xl leading-[1.1] text-cream drop-shadow-2xl tracking-tight whitespace-pre-line"
                >
                  {(content.heroHeading || "Your Modest\nIdentity")
                    .split("\n")
                    .map((line, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <br />}
                        {line}
                      </React.Fragment>
                    ))}
                </motion.h1>

                {/* UPGRADE 1 & 2: Subtext with elegant styling */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mt-5 text-cream/85 text-base md:text-lg max-w-md leading-relaxed font-serif italic"
                >
                  {content.heroSubtext}
                </motion.p>

                {/* UPGRADE 5: Subtle Gold Accent Line */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="origin-left mt-6 mb-6"
                >
                  <div className="w-12 h-[2px] bg-gold" />
                </motion.div>

                {/* UPGRADE 1 & 3: Better CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/shop"
                      className="block bg-cream text-taupe px-8 py-4 rounded-md uppercase tracking-wider text-sm font-semibold shadow-lg hover:shadow-xl hover:bg-gold hover:text-cream transition-all duration-300 text-center"
                    >
                      Shop Now
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <a
                      href={BRAND.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-cream text-cream backdrop-blur-sm bg-black/10 px-8 py-4 rounded-md uppercase tracking-wider text-sm font-semibold hover:bg-cream hover:text-taupe transition-all duration-300 flex items-center justify-center gap-2 select-none text-center"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>Order on WhatsApp</span>
                    </a>
                  </motion.div>
                </motion.div>

                {/* UPGRADE 1 & 4: Trust Badges with Elegant Separators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3 text-cream/80 text-xs sm:text-sm font-sans"
                >
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    Free Shipping above ₹{settings.freeShippingAbove.toLocaleString("en-IN")}
                  </span>
                  <span className="text-gold/70">•</span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    COD Available
                  </span>
                  <span className="text-gold/70">•</span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    Saudi & Korean Silks
                  </span>
                </motion.div>
              </div>
            </div>

            {/* UPGRADE 6: Subtle Scroll Hint at Bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cream/50 text-[10px] tracking-[0.3em] uppercase flex flex-col items-center gap-1.5 animate-bounce pointer-events-none z-20">
              <span>Scroll</span>
              <ChevronDown className="w-4 h-4 text-gold/80" />
            </div>
          </div>

          {/* ============ DESKTOP (lg and above) ============ */}
          <div className="hidden lg:block bg-gradient-to-br from-cream via-beige to-sand">
            <div className="max-w-7xl mx-auto px-6 py-24">
              <div className="grid grid-cols-2 gap-16 items-center">
                {/* LEFT: Text content */}
                <div>
                  <p className="text-xs tracking-[0.4em] text-gold uppercase mb-6 font-semibold">
                    {content.heroLabel || "MODEST FASHION"}
                  </p>

                  <h1 className="font-serif text-7xl text-taupe leading-[1.05] whitespace-pre-line">
                    {content.heroHeading || "Your Modest\nIdentity"}
                  </h1>

                  <p className="mt-6 text-taupe/70 text-lg italic font-serif max-w-md leading-relaxed">
                    {content.heroSubtext}
                  </p>

                  {/* Gold accent line */}
                  <div className="w-16 h-[2px] bg-gold my-8" />

                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/shop"
                      className="bg-taupe text-cream px-8 py-4 rounded-md hover:bg-gold transition-all duration-300 uppercase tracking-wider text-sm font-semibold shadow-lg hover:shadow-xl"
                    >
                      Shop Now
                    </Link>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-taupe text-taupe px-8 py-4 rounded-md hover:bg-taupe hover:text-cream transition-all duration-300 uppercase tracking-wider text-sm font-semibold flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Order on WhatsApp
                    </a>
                  </div>

                  {/* Trust badges */}
                  <div className="mt-8 flex flex-wrap gap-4 text-taupe/60 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-gold" />
                      Free Shipping above ₹{settings.freeShippingAbove.toLocaleString("en-IN")}
                    </span>
                    <span className="text-taupe/30">•</span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-gold" />
                      COD Available
                    </span>
                    <span className="text-taupe/30">•</span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-gold" />
                      Saudi & Korean Silks
                    </span>
                  </div>
                </div>

                {/* RIGHT: Image */}
                <div className="flex justify-center">
                  {content.heroImages && content.heroImages.length > 0 ? (
                    <div className="w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative">
                      {/* Use the slider with normal aspect ratio mode */}
                      <HeroImageSlider images={content.heroImages} />
                    </div>
                  ) : (
                    <div className="w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-sand to-beige shadow-2xl flex items-center justify-center">
                      <p className="font-italiana text-4xl text-taupe/30 tracking-wider">
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
