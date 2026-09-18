"use client";

import React from "react";
import Link from "next/link";
import { Shirt, User, EyeOff, Crown, ArrowRight, Sparkles, Heart, Truck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import FeaturedProductsClient from "@/components/FeaturedProductsClient";
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
  const categories = [
    { name: "Abaya", slug: "abaya", icon: Shirt, letter: "A" },
    { name: "Burkha", slug: "burkha", icon: User, letter: "B" },
    { name: "Niqab", slug: "niqab", icon: EyeOff, letter: "N" },
    { name: "Hijab", slug: "hijab", icon: Crown, letter: "H" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative w-full bg-gradient-to-b from-cream via-beige/50 to-beige border-b border-sand/40 overflow-hidden">
          {/* Subtle floating background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 25, -15, 0],
                y: [0, -20, 15, 0],
                scale: [1, 1.08, 0.95, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-gold/15 to-sand/20 blur-3xl opacity-60"
            />
            <motion.div
              animate={{
                x: [0, -20, 20, 0],
                y: [0, 25, -15, 0],
                scale: [1, 0.95, 1.08, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tl from-sand/30 to-gold/10 blur-3xl opacity-50"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* LEFT COLUMN (content, vertically centered) */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex flex-col justify-center items-start text-left space-y-6"
              >
                {/* Small label: "MODEST FASHION" (gold, tracking-[0.3em], text-xs, uppercase) */}
                <motion.div variants={fadeInUp}>
                  <span className="inline-block text-xs font-semibold tracking-[0.3em] text-gold uppercase font-sans">
                    {content.heroLabel || "MODEST FASHION"}
                  </span>
                </motion.div>

                {/* Big serif heading (5xl on mobile, 7xl on desktop): "Your Modest Identity" with line break */}
                <motion.h1
                  variants={fadeInUp}
                  className="font-serif text-5xl sm:text-6xl lg:text-7xl text-taupe leading-[1.08] tracking-tight whitespace-pre-line"
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

                {/* Subtext (taupe/70, max-w-md, leading-relaxed) */}
                <motion.p
                  variants={fadeInUp}
                  className="text-base sm:text-lg text-taupe/70 max-w-md font-sans leading-relaxed"
                >
                  {content.heroSubtext}
                </motion.p>

                {/* Buttons row (flex gap-3 flex-wrap) */}
                <motion.div
                  variants={fadeInUp}
                  className="pt-2 flex flex-wrap items-center gap-3 w-full sm:w-auto"
                >
                  <Link
                    href="/shop"
                    className="bg-taupe text-cream px-8 py-4 rounded-md hover:bg-gold transition-all duration-300 shadow-md hover:shadow-lg font-medium tracking-wide text-center w-full sm:w-auto inline-flex items-center justify-center select-none"
                  >
                    Shop Now
                  </Link>

                  <a
                    href={BRAND.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-taupe text-taupe px-8 py-4 rounded-md hover:bg-taupe hover:text-cream transition-all duration-300 flex items-center justify-center gap-2 font-medium tracking-wide text-center w-full sm:w-auto select-none group"
                  >
                    <FaWhatsapp className="w-5 h-5 text-[#25D366] group-hover:text-cream transition-colors" />
                    <span>Order on WhatsApp</span>
                  </a>
                </motion.div>

                {/* Trust badges row below the buttons (mt-8, flex gap-6, text-xs taupe/60) */}
                <motion.div
                  variants={fadeInUp}
                  className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-taupe/70 font-sans"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-gold font-bold text-sm">✓</span>
                    <span>Free Shipping above ₹1999</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gold font-bold text-sm">✓</span>
                    <span>COD Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gold font-bold text-sm">✓</span>
                    <span>Premium Quality</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* RIGHT COLUMN (visual, hidden on mobile) */}
              <div className="hidden lg:flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-sand/50 bg-gradient-to-br from-sand via-beige to-sand p-8 flex flex-col justify-between select-none"
                >
                  {/* Large circular shape (bg-gold/10) positioned absolute */}
                  <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold/15 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-taupe/5 blur-2xl pointer-events-none" />

                  {/* Small decorative dots pattern */}
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(#6B5B4E 1px, transparent 1px)",
                      backgroundSize: "18px 18px",
                    }}
                  />

                  {/* Elegant luxury frame with watermark */}
                  <div className="relative z-10 w-full h-full border border-gold/30 rounded-xl p-6 flex flex-col justify-between items-center text-center backdrop-blur-[1px] bg-cream/20">
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.3em] uppercase text-taupe/60 font-semibold font-sans">
                        Luxury Collection
                      </span>
                      <Sparkles className="w-4 h-4 text-gold" />
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-3 my-auto">
                      <span className="font-serif text-5xl font-bold tracking-widest text-taupe/20 uppercase">
                        ALSAYYEDAH
                      </span>
                      <div className="w-12 h-0.5 bg-gold/50 rounded-full" />
                      <p className="font-serif text-lg text-taupe/70 italic">
                        Artisan Modest Identity
                      </p>
                      <span className="inline-block text-[10px] font-sans uppercase tracking-[0.25em] text-gold font-semibold bg-taupe/90 text-cream px-3 py-1 rounded-full shadow-sm mt-2">
                        Timeless Elegance
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-between pt-4 border-t border-gold/20 text-[11px] text-taupe/60 font-sans">
                      <span>Pure Saudi & Korean Silks</span>
                      <span className="text-gold font-medium">Pan-India Express</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CATEGORIES SECTION */}
        <section className="w-full bg-cream py-20 border-b border-sand/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="text-gold text-xs tracking-[0.3em] uppercase font-semibold block"
              >
                CATEGORIES
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-serif text-3xl sm:text-4xl text-taupe mt-2 tracking-wide"
              >
                {content.categoriesTitle || "Shop by Category"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-taupe/60 text-center mt-3 max-w-lg mx-auto font-sans text-sm sm:text-base leading-relaxed"
              >
                Handcrafted modest wear for every occasion
              </motion.p>
            </div>

            {/* Grid */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <motion.div
                    key={cat.slug}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Link
                      href={`/shop?c=${cat.slug}`}
                      className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border border-sand/50 hover:border-gold transition-colors duration-300 shadow-sm hover:shadow-md block bg-gradient-to-br from-sand to-beige"
                    >
                      {/* Background Pattern Layer */}
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage: "radial-gradient(#6B5B4E 1.2px, transparent 1.2px)",
                          backgroundSize: "16px 16px",
                        }}
                      />

                      {/* Large decorative serif initial letter watermark */}
                      <span className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-8xl md:text-9xl font-bold text-taupe/10 group-hover:text-gold/20 transition-colors duration-500 select-none pointer-events-none">
                        {cat.letter}
                      </span>

                      {/* Icon layer (top, centered) */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                        <IconComponent className="w-16 h-16 text-taupe/30 group-hover:text-gold transition-colors duration-300" />
                      </div>

                      {/* Subtle hover darkening layer */}
                      <div className="absolute inset-0 bg-taupe/0 group-hover:bg-taupe/10 transition-colors duration-300 pointer-events-none" />

                      {/* Content layer (bottom) */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-16">
                        <span className="font-serif text-2xl font-semibold text-cream group-hover:text-gold transition-colors duration-300 block drop-shadow-md">
                          {cat.name}
                        </span>
                        <span className="text-cream/90 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 font-sans font-medium drop-shadow-sm">
                          Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS SECTION */}
        <FeaturedProductsClient
          initialProducts={initialProducts}
          title={content.featuredTitle}
        />


        {/* 4. BRAND STORY SECTION */}
        <section className="w-full bg-cream border-y border-sand/40 py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* LEFT COLUMN (visual) */}
              <motion.div
                variants={slideInLeft}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.25 }}
                className="w-full flex justify-center"
              >
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
