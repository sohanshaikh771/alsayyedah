"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroImageSlider({
  images,
  fillMode = false,
}: {
  images: string[];
  fillMode?: boolean;
}) {
  const [current, setCurrent] = useState(0);

  const validImages = (images || []).filter((img) => Boolean(img && img.trim()));

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [validImages.length]);

  if (!validImages || validImages.length === 0) return null;

  // 1. FULL BACKGROUND FILL MODE (Used for Mobile)
  if (fillMode) {
    if (validImages.length === 1) {
      return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={validImages[0]}
            alt="ALSayyedah"
            className="w-full h-full object-cover object-center"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      );
    }

    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            key={current}
            src={validImages[current]}
            alt={`ALSayyedah ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* SLIDER DOTS */}
        {validImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {validImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={
                  i === current
                    ? "w-2.5 h-2.5 rounded-full bg-gold transition-all duration-300 cursor-pointer shadow-xs"
                    : "w-2.5 h-2.5 rounded-full bg-cream/60 hover:bg-cream transition-all duration-300 cursor-pointer"
                }
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. STANDARD CARD MODE (Used for Desktop Two-Column)
  if (validImages.length === 1) {
    return (
      <div className="w-full aspect-[4/5] rounded-lg overflow-hidden shadow-xl relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[0]}
          alt="ALSayyedah"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[4/5] rounded-lg overflow-hidden shadow-xl relative">
      <AnimatePresence mode="wait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={current}
          src={validImages[current]}
          alt={`ALSayyedah ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Dots at bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
        {validImages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={
              i === current
                ? "w-2.5 h-2.5 rounded-full bg-gold transition-all duration-300 cursor-pointer shadow-xs"
                : "w-2.5 h-2.5 rounded-full bg-cream/60 hover:bg-cream transition-all duration-300 cursor-pointer"
            }
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
