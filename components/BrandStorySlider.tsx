"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BrandStorySlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  const validImages = (images || []).filter((img) => Boolean(img && img.trim()));

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [validImages.length]);

  if (!validImages || validImages.length === 0) {
    return null;
  }

  if (validImages.length === 1) {
    return (
      <div className="w-full max-w-lg aspect-[4/5] rounded-lg overflow-hidden shadow-xl relative">
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
    <div className="w-full max-w-lg aspect-[4/5] rounded-lg overflow-hidden shadow-xl relative group">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={validImages[current]}
          alt={`ALSayyedah ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {validImages.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={
              i === current
                ? "w-2 h-2 rounded-full bg-gold transition-all duration-300 cursor-pointer"
                : "w-2 h-2 rounded-full bg-cream/50 hover:bg-cream transition-all duration-300 cursor-pointer"
            }
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
