"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumButton from "@/components/PremiumButton";
import { useWishlist, WishlistItem } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const items = useWishlist((s) => s.items);
  const removeItem = useWishlist((s) => s.removeItem);
  const clearWishlist = useWishlist((s) => s.clearWishlist);
  const addItemToCart = useCart((s) => s.addItem);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (item: WishlistItem) => {
    addItemToCart({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      image: item.image,
      size: "Standard",
      color: "Default",
      qty: 1,
    });

    setAddedMap((prev) => ({ ...prev, [item.productId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.productId]: false }));
    }, 1800);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full animate-pulse">
          <div className="h-10 w-48 bg-sand/50 rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-sand/40 rounded-md" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {isEmpty ? (
          /* Empty State */
          <div className="py-20 max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 rounded-full bg-sand/30 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-taupe/30 stroke-1" />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-taupe tracking-wide">
              Your wishlist is empty
            </h1>

            <p className="text-sm text-taupe/60 mt-2.5 font-sans leading-relaxed">
              Save your favorite items here for later by clicking the heart icon on any product.
            </p>

            <div className="mt-8">
              <PremiumButton href="/shop" variant="primary" size="md">
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </PremiumButton>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div>
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-sand">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-taupe tracking-wide">
                  My Wishlist
                </h1>
                <p className="text-sm text-taupe/60 mt-1 font-sans">
                  {items.length} {items.length === 1 ? "item" : "items"} saved for later
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="text-xs font-medium text-taupe/60 hover:text-red-500 underline self-start sm:self-auto cursor-pointer transition-colors"
                >
                  Clear Wishlist
                </button>
              )}
            </div>

            {/* Grid */}
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8"
            >
              <AnimatePresence>
                {items.map((item) => {
                  const isAdded = addedMap[item.productId];

                  return (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="group bg-cream rounded-md border border-sand overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
                    >
                      {/* Image + Remove Icon */}
                      <div className="relative aspect-[3/4] w-full bg-sand/30 overflow-hidden">
                        <Link href={`/product/${item.slug}`} className="block w-full h-full">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        </Link>

                        {/* Remove Heart button top-right */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-cream/90 backdrop-blur-xs hover:bg-cream text-red-500 shadow-xs transition-transform hover:scale-110 cursor-pointer z-10"
                          aria-label="Remove from wishlist"
                          title="Remove from wishlist"
                        >
                          <Heart className="w-4 h-4 fill-red-500 stroke-red-500" />
                        </button>
                      </div>

                      {/* Content & Actions */}
                      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                        <div>
                          <Link href={`/product/${item.slug}`}>
                            <h3 className="font-serif text-sm sm:text-base font-medium text-taupe hover:text-gold transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="font-semibold text-sm sm:text-base text-taupe mt-1">
                            ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className={`w-full py-2 px-3 rounded text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isAdded
                              ? "bg-emerald-700 text-white"
                              : "bg-taupe text-cream hover:bg-gold"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added to Bag</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
