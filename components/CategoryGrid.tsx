"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { getActiveCategories } from "@/lib/categories-firestore";

export default function CategoryGrid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-3 w-32 bg-sand rounded shimmer mx-auto" />
            <div className="h-8 w-64 bg-sand rounded shimmer mx-auto mt-3" />
            <div className="h-4 w-96 bg-sand rounded shimmer mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-sand rounded-lg shimmer"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-cream py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">
            CATEGORIES
          </p>
          <h2 className="font-serif text-4xl text-taupe mt-2">
            Shop by Category
          </h2>
          <p className="text-taupe/60 mt-3 max-w-lg mx-auto">
            Handcrafted modest wear for every occasion
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {categories.map((cat: any, i: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/shop?c=${cat.slug}`}
                className="group relative aspect-[3/4] rounded-lg 
                  overflow-hidden cursor-pointer block border 
                  border-sand/50 hover:border-gold transition"
              >
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover 
                      group-hover:scale-105 transition duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br 
                    from-sand to-beige flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-taupe/30" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t 
                  from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif text-2xl text-cream 
                    font-semibold drop-shadow-lg">
                    {cat.name}
                  </h3>
                  <p className="text-cream/90 text-xs mt-1 opacity-0 
                    group-hover:opacity-100 transition-opacity 
                    duration-300">
                    Explore Collection →
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
