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

  if (validImages.length === 1) {
    return fillMode ? (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[0]}
          alt="ALSayyedah"
          className="w-full h-full object-cover object-center md:object-top"
        />
      </div>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={validImages[0]}
        alt="ALSayyedah"
        className="w-full h-full object-cover"
      />
    );
  }

  return fillMode ? (
    // fill mode (mobile background)
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={current}
          src={validImages[current]}
          alt={`ALSayyedah ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover object-center md:object-top"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Dots for mobile fillMode */}
      {validImages.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {validImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-8 bg-gold shadow-sm"
                  : "w-2 bg-cream/40 hover:bg-cream/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  ) : (
    // contained mode (desktop)
    <div className="w-full h-full relative">
      <AnimatePresence mode="wait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          key={current}
          src={validImages[current]}
          alt={`ALSayyedah ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Dots */}
      {validImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {validImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? "w-8 bg-gold shadow-sm"
                  : "w-2 bg-cream/60 hover:bg-cream"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
