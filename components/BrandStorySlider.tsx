"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface BrandStorySliderProps {
  images?: string[];
  tagline?: string;
}

export default function BrandStorySlider({
  images = [],
  tagline = "Your Modest Identity",
}: BrandStorySliderProps) {
  const [current, setCurrent] = useState(0);

  // Filter out any empty strings
  const validImages = images.filter((img) => Boolean(img && img.trim()));

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImages.length]);

  // Fallback card design if no images are provided
  if (!validImages || validImages.length === 0) {
    return (
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full max-w-lg aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden border border-sand/50 shadow-xl bg-gradient-to-br from-sand via-beige to-sand/90 p-8 flex flex-col justify-between select-none"
      >
        {/* Large decorative serif letter "A" watermark */}
        <span className="absolute inset-0 flex items-center justify-center font-serif text-[12rem] font-bold text-taupe/10 select-none pointer-events-none">
          A
        </span>

        {/* Thin gold circle outline */}
        <div className="absolute top-8 right-8 w-32 h-32 border border-gold/30 rounded-full pointer-events-none" />

        {/* Dots pattern */}
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
              {tagline}
            </p>
          </div>

          <div className="pt-4 border-t border-gold/20 flex items-center justify-between text-[11px] text-taupe/60 font-sans">
            <span>Heritage & Modesty</span>
            <span className="text-gold font-medium">Delivered Across India</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Single static image
  if (validImages.length === 1) {
    return (
      <div className="w-full max-w-lg aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden border border-sand/50 shadow-xl relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[0]}
          alt="ALSayyedah Craftsmanship"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Multiple images: auto-sliding carousel
  return (
    <div className="w-full max-w-lg aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden border border-sand/50 shadow-xl relative group">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={validImages[current]}
          alt={`ALSayyedah Craftsmanship ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-taupe/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
        {validImages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={
              i === current
                ? "w-2.5 h-2.5 rounded-full bg-gold transition-all duration-300 cursor-pointer"
                : "w-2 h-2 rounded-full bg-cream/60 hover:bg-cream transition-all duration-300 cursor-pointer"
            }
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
