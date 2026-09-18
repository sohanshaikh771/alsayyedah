"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  category = "abaya",
}: SizeGuideModalProps) {
  const normalizedCategory = category ? category.toLowerCase() : "abaya";

  const getInitialTab = (cat: string): "abaya" | "hijab" | "niqab" => {
    if (cat.includes("hijab")) return "hijab";
    if (cat.includes("niqab")) return "niqab";
    return "abaya";
  };

  const [activeTab, setActiveTab] = useState<"abaya" | "hijab" | "niqab">(
    getInitialTab(normalizedCategory)
  );

  useEffect(() => {
    setActiveTab(getInitialTab(normalizedCategory));
  }, [normalizedCategory]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-cream rounded-lg p-6 border border-sand shadow-2xl text-taupe"
          >
            {/* Header row */}
            <div className="flex items-center justify-between pb-4 border-b border-sand/60">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-2xl font-medium text-taupe">
                  Size Guide
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-taupe hover:bg-beige hover:text-gold transition-colors cursor-pointer"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Intro text */}
            <p className="text-sm text-taupe/70 mt-4 mb-6 leading-relaxed">
              Find your perfect fit. All measurements are in inches. For best results, measure over light clothing.
            </p>

            {/* Category Navigation Tabs */}
            <div className="flex border-b border-sand mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("abaya")}
                className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === "abaya"
                    ? "border-taupe text-taupe"
                    : "border-transparent text-taupe/50 hover:text-taupe"
                }`}
              >
                Abaya &amp; Burkha
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("hijab")}
                className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === "hijab"
                    ? "border-taupe text-taupe"
                    : "border-transparent text-taupe/50 hover:text-taupe"
                }`}
              >
                Hijab
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("niqab")}
                className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === "niqab"
                    ? "border-taupe text-taupe"
                    : "border-transparent text-taupe/50 hover:text-taupe"
                }`}
              >
                Niqab
              </button>
            </div>

            {/* 1. Size Table for ABAYA & BURKHA */}
            {activeTab === "abaya" && (
              <div className="overflow-x-auto rounded-md border border-sand shadow-2xs">
                <table className="w-full text-left text-sm text-taupe">
                  <thead className="bg-sand text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Bust (in)</th>
                      <th className="py-3 px-4">Length (in)</th>
                      <th className="py-3 px-4">Sleeve (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/60">
                    <tr className="bg-cream">
                      <td className="py-3 px-4 font-semibold text-taupe">S</td>
                      <td className="py-3 px-4">36</td>
                      <td className="py-3 px-4">54</td>
                      <td className="py-3 px-4">22</td>
                    </tr>
                    <tr className="bg-beige">
                      <td className="py-3 px-4 font-semibold text-taupe">M</td>
                      <td className="py-3 px-4">38</td>
                      <td className="py-3 px-4">56</td>
                      <td className="py-3 px-4">22</td>
                    </tr>
                    <tr className="bg-cream">
                      <td className="py-3 px-4 font-semibold text-taupe">L</td>
                      <td className="py-3 px-4">40</td>
                      <td className="py-3 px-4">58</td>
                      <td className="py-3 px-4">23</td>
                    </tr>
                    <tr className="bg-beige">
                      <td className="py-3 px-4 font-semibold text-taupe">XL</td>
                      <td className="py-3 px-4">42</td>
                      <td className="py-3 px-4">60</td>
                      <td className="py-3 px-4">23</td>
                    </tr>
                    <tr className="bg-cream">
                      <td className="py-3 px-4 font-semibold text-taupe">XXL</td>
                      <td className="py-3 px-4">44</td>
                      <td className="py-3 px-4">62</td>
                      <td className="py-3 px-4">24</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. Size Table for HIJAB */}
            {activeTab === "hijab" && (
              <div className="rounded-md border border-sand bg-beige/60 p-6 text-center">
                <span className="font-serif text-lg font-medium text-taupe block mb-1">
                  Free Size
                </span>
                <p className="text-sm font-medium text-taupe">
                  70 x 28 inches (approximate)
                </p>
                <p className="text-xs text-taupe/70 mt-2 max-w-sm mx-auto">
                  Generous, flowy length tailored for elegant draping, high chest coverage, and all styling variations.
                </p>
              </div>
            )}

            {/* 3. Size Table for NIQAB */}
            {activeTab === "niqab" && (
              <div className="rounded-md border border-sand bg-beige/60 p-6 text-center">
                <span className="font-serif text-lg font-medium text-taupe block mb-1">
                  Free Size
                </span>
                <p className="text-sm font-medium text-taupe">
                  Adjustable straps, one size fits all
                </p>
                <p className="text-xs text-taupe/70 mt-2 max-w-sm mx-auto">
                  Equipped with gentle tie-back ribbons designed for a secure, custom, and breathable all-day fit.
                </p>
              </div>
            )}

            {/* HOW TO MEASURE SECTION */}
            <div className="mt-6 pt-5 border-t border-sand/60">
              <h3 className="text-sm font-medium text-taupe mb-3">
                How to Measure
              </h3>
              <ul className="text-sm text-taupe/70 space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-taupe">Bust:</strong> Measure around the fullest part of your chest
                </li>
                <li>
                  <strong className="text-taupe">Length:</strong> Measure from shoulder to desired hem
                </li>
                <li>
                  <strong className="text-taupe">Sleeve:</strong> Measure from shoulder seam to wrist
                </li>
              </ul>
            </div>

            {/* TIP NOTE BOX */}
            <div className="mt-6 bg-beige rounded-md p-4 border border-sand/50">
              <p className="text-xs text-taupe leading-relaxed">
                <strong className="font-semibold text-gold">Tip:</strong> If you&apos;re between sizes, we recommend sizing up for a more comfortable fit.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
