"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import PremiumButton from "@/components/PremiumButton";
import { Product, getFeaturedProducts } from "@/lib/products-firestore";
import { SiteContent, defaultContent } from "@/lib/content-firestore";
import { BRAND } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface HomeClientProps {
  initialProducts?: Product[];
  content?: SiteContent;
}

export default function HomeClient({
  initialProducts = [],
  content = defaultContent,
}: HomeClientProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    if (initialProducts.length === 0) {
      getFeaturedProducts().then((products) => {
        setFeaturedProducts(products);
      });
    }
  }, [initialProducts]);

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
        <section className="relative w-full bg-beige py-24 md:py-32 border-b border-sand/40 overflow-hidden">
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

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6"
          >
            {/* "MODEST FASHION" label: fadeInUp */}
            <motion.div variants={fadeInUp}>
              <span className="inline-block text-xs md:text-sm font-semibold tracking-widest text-gold uppercase">
                {content.heroLabel}
              </span>
            </motion.div>

            {/* Big heading: fadeInUp with delay 0.1 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl text-taupe leading-tight whitespace-pre-line tracking-tight"
            >
              {content.heroHeading.split("\n").map((line, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </motion.h1>

            {/* Subtext: fadeInUp with delay 0.2 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="text-base sm:text-lg text-taupe/70 max-w-xl mx-auto font-sans leading-relaxed"
            >
              {content.heroSubtext}
            </motion.p>

            {/* Buttons: fadeInUp with delay 0.3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <PremiumButton
                href="/shop"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Shop Now
              </PremiumButton>

              <PremiumButton
                href={BRAND.whatsappLink}
                target="_blank"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </PremiumButton>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. CATEGORIES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl sm:text-4xl text-taupe text-center mb-10 tracking-wide"
          >
            {content.categoriesTitle}
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.slug}
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Link
                  href={`/shop?c=${cat.slug}`}
                  className="group relative aspect-square flex flex-col items-center justify-center bg-beige border border-sand rounded-md p-6 text-center transition-colors duration-300 hover:bg-sand/60 hover:shadow-sm block h-full w-full"
                >
                  <span className="font-serif text-2xl sm:text-3xl text-taupe group-hover:text-gold transition-colors tracking-wide">
                    {cat.name}
                  </span>

                  <span className="w-8 h-0.5 bg-gold my-3 rounded-full group-hover:w-12 transition-all duration-300" />

                  <span className="text-xs uppercase tracking-widest text-taupe/60 font-sans group-hover:text-taupe transition-colors">
                    View Collection
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 3. FEATURED PRODUCTS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-sand/40">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl sm:text-4xl text-taupe text-center mb-10 tracking-wide"
          >
            {content.featuredTitle}
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {featuredProducts.length > 0
              ? featuredProducts.map((product) => (
                  <motion.div key={product.id} variants={fadeInUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              : Array.from({ length: 4 }).map((_, idx) => (
                  <motion.div key={idx} variants={fadeInUp}>
                    <ProductCardSkeleton />
                  </motion.div>
                ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              href="/shop"
              className="inline-block text-taupe font-sans text-sm font-semibold tracking-wide underline underline-offset-8 hover:text-gold transition-colors"
            >
              View All Products
            </Link>
          </motion.div>
        </section>

        {/* 4. BRAND STORY SECTION */}
        <section className="bg-beige border-y border-sand/40 py-20">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.25 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-xs font-semibold uppercase tracking-widest text-gold"
            >
              {content.storyLabel}
            </motion.span>

            <motion.h2
              variants={fadeInUp}
              className="font-serif text-3xl sm:text-4xl text-taupe tracking-wide"
            >
              {content.storyHeading}
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              className="space-y-4 text-taupe/80 font-sans leading-relaxed text-sm sm:text-base"
            >
              <motion.p variants={fadeInUp}>
                {content.storyParagraph1}
              </motion.p>
              <motion.p variants={fadeInUp}>
                {content.storyParagraph2}
              </motion.p>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="font-serif text-2xl sm:text-3xl text-gold pt-4 tracking-wider italic"
            >
              {content.storyTagline}
            </motion.p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
