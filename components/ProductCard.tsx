"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cardHover } from "@/lib/animations";
import { Product } from "@/lib/products-firestore";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const hasDiscount = Boolean(product.mrp && product.mrp > product.price);
  const discountPercent =
    hasDiscount && product.mrp
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block focus:outline-none"
    >
      <motion.div {...cardHover} className="rounded-md">
        {/* 3:4 Aspect Ratio Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-sand/40 border border-sand/60">
          {!imgError ? (
            <Image
              src={product.images[0] || `/products/${product.slug}-1.jpg`}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-beige p-4 text-center transition-colors duration-300 group-hover:bg-sand/30">
              {/* Subtle Hijab / Modest Silhouette Icon */}
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-taupe/35 mb-2 transition-transform duration-500 group-hover:scale-110"
                aria-hidden="true"
              >
                <path
                  d="M32 8C21 8 16 17 16 27C16 38 20 46 24 56H40C44 46 48 38 48 27C48 17 43 8 32 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25 24C25 27.5 28 30 32 30C36 30 39 27.5 39 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 38C26 42 38 42 44 38"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-serif text-sm tracking-wide text-taupe/60 italic capitalize">
                {product.category}
              </span>
            </div>
          )}

          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Quick View Button that appears on hover */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-cream text-taupe px-4 py-2 rounded-full text-xs font-medium shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap pointer-events-none z-10">
            View Details
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton product={product} />
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-gold text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                {discountPercent}% OFF
              </span>
            </div>
          )}

          {/* Out of Stock Badge */}
          {product.stock === 0 && (
            <div className={`absolute ${hasDiscount ? "top-10" : "top-3"} left-3 z-10`}>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Details Below Image */}
        <div className="mt-3.5 space-y-1 text-left">
          <h3 className="font-serif text-lg font-medium text-taupe tracking-wide group-hover:text-gold transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-taupe/60 tracking-wider">
            {product.fabric}
          </p>

          {/* Price Row */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-base font-bold text-taupe transition-colors duration-300">
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            {hasDiscount && product.mrp && (
              <span className="text-xs text-taupe/50 line-through transition-colors duration-300">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}

            {hasDiscount && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 transition-colors duration-300">
                {discountPercent}% off
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
