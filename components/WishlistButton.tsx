"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist, WishlistItem } from "@/lib/wishlist-store";

interface WishlistProductInput {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[];
}

interface WishlistButtonProps {
  product: WishlistProductInput;
  variant?: "icon" | "button";
  className?: string;
}

export default function WishlistButton({
  product,
  variant = "icon",
  className = "",
}: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false);
  const toggleItem = useWishlist((s) => s.toggleItem);
  const inWishlist = useWishlist((s) => s.isInWishlist(product.id));

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSaved = mounted ? inWishlist : false;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const item: WishlistItem = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || `/products/${product.slug}-1.jpg`,
    };

    toggleItem(item);
  };

  if (variant === "button") {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={handleToggle}
        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md border font-sans text-sm font-medium transition-colors cursor-pointer ${
          isSaved
            ? "border-rose-400 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-sand bg-cream text-taupe hover:border-gold hover:text-gold"
        } ${className}`}
        aria-label={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isSaved ? "fill-red-500 stroke-red-500 text-red-500" : "stroke-taupe text-taupe"
          }`}
        />
        <span>{isSaved ? "In Wishlist" : "Add to Wishlist"}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={handleToggle}
      className={`p-2 rounded-full bg-cream/90 backdrop-blur-xs hover:bg-cream shadow-xs transition-colors cursor-pointer flex items-center justify-center ${className}`}
      aria-label={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
      title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isSaved
            ? "fill-red-500 stroke-red-500 text-red-500"
            : "stroke-taupe text-taupe hover:text-gold"
        }`}
      />
    </motion.button>
  );
}
