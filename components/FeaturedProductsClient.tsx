"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";
import { Product, getFeaturedProducts, getAllProducts } from "@/lib/products-firestore";
import { BRAND } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

interface FeaturedProductsClientProps {
  initialProducts?: Product[];
  title?: string;
}

export default function FeaturedProductsClient({
  initialProducts = [],
  title = "Featured Products",
}: FeaturedProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);

  useEffect(() => {
    let isMounted = true;

    // If fewer than 4 products were passed, fetch and fill up to 8
    if (initialProducts.length < 4) {
      setLoading(true);
      getFeaturedProducts()
        .then(async (featured) => {
          let list = [...featured];
          if (list.length < 4) {
            const all = await getAllProducts();
            const featuredIds = new Set(featured.map((p) => p.id));
            const others = all.filter((p) => !featuredIds.has(p.id));
            list = [...featured, ...others].slice(0, 8);
          }
          if (isMounted) {
            setProducts(list.slice(0, 8));
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load featured products:", err);
          if (isMounted) setLoading(false);
        });
    } else {
      setProducts(initialProducts.slice(0, 8));
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [initialProducts]);

  return (
    <section className="relative overflow-hidden isolate bg-gradient-to-b from-cream to-beige py-16 md:py-24 border-t border-sand/40">
      {/* Decorative background glow elements */}
      <div
        className="absolute top-1/4 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-0 w-72 h-72 bg-sand/40 rounded-full blur-3xl -z-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Small label with gold lines on sides */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <span className="w-8 h-[1px] bg-gold/60" />
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-gold uppercase font-semibold font-sans">
              HANDPICKED
            </p>
            <span className="w-8 h-[1px] bg-gold/60" />
          </motion.div>

          {/* Main heading — bigger serif */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl text-taupe leading-tight"
          >
            {title}
          </motion.h2>

          {/* Subtext — italic serif, elegant */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-taupe/60 text-sm md:text-base italic font-serif max-w-lg mx-auto leading-relaxed"
          >
            Our best sellers loved by customers
          </motion.p>
        </div>

        {/* Product Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* View All Products Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 md:mt-16 text-center"
            >
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 border-2 border-taupe text-taupe px-8 md:px-10 py-3 md:py-4 rounded-md hover:bg-taupe hover:text-cream transition-all duration-300 uppercase tracking-wider text-xs md:text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </>
        ) : (
          /* Empty state (if truly no products) */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="bg-cream border border-dashed border-sand rounded-lg p-12 sm:p-16 max-w-md mx-auto text-center"
          >
            <Package className="w-12 h-12 text-taupe/30 mx-auto" />
            <h3 className="font-serif text-xl text-taupe mt-4">
              New collection coming soon
            </h3>
            <p className="text-taupe/60 text-sm mt-2 font-sans">
              Follow us on Instagram for updates
            </p>
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-taupe text-taupe px-6 py-2 rounded-md mt-4 text-xs font-sans font-medium uppercase tracking-wider hover:bg-taupe hover:text-cream transition-all"
            >
              Follow {BRAND.instagramHandle}
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
