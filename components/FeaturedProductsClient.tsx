"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
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

    // If fewer than 3 products were passed, fetch and fill up to 8
    if (initialProducts.length < 3) {
      setLoading(true);
      getFeaturedProducts()
        .then(async (featured) => {
          let list = featured;
          if (list.length < 3) {
            const all = await getAllProducts();
            const existingIds = new Set(list.map((p) => p.id));
            const additional = all.filter((p) => !existingIds.has(p.id));
            list = [...list, ...additional];
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
    <section className="relative overflow-hidden isolate bg-beige py-10 sm:py-16 border-t border-sand/40">
      {/* Subtle decorative background circle behind grid */}
      <div
        className="absolute top-20 right-0 -z-10 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-gold text-xs tracking-[0.3em] uppercase font-semibold block"
          >
            HANDPICKED
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl text-taupe mt-2 tracking-wide"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-taupe/60 text-center mt-2 max-w-lg mx-auto font-sans text-sm sm:text-base leading-relaxed"
          >
            Our best sellers loved by customers
          </motion.p>
        </div>

        {/* Product Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* "View All Products" Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 sm:mt-12 flex justify-center"
            >
              <Link
                href="/shop"
                className="border-2 border-taupe text-taupe px-8 py-3.5 min-h-[44px] rounded-md hover:bg-taupe hover:text-cream transition-all duration-300 font-medium tracking-wide text-sm font-sans inline-flex items-center justify-center w-full sm:w-auto max-w-xs shadow-sm hover:shadow-md"
              >
                View All Products →
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
