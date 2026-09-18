"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { listenBanners, Banner } from "@/lib/banners-firestore";

export default function BannerStrip() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle client-side mount & localStorage check
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("alsayyedah_dismissed_banners");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading dismissed banners from localStorage:", e);
    }
  }, []);

  // Listen to banners collection
  useEffect(() => {
    const unsubscribe = listenBanners((allBanners) => {
      setBanners(allBanners);
    });

    return () => unsubscribe();
  }, []);

  // Filter top banners: active, position === "top", date range valid, not dismissed
  const activeTopBanners = banners.filter((b) => {
    if (!b.active || b.position !== "top") return false;
    if (dismissedIds.includes(b.id)) return false;

    const now = new Date();

    if (b.startDate) {
      const start = new Date(b.startDate);
      if (!isNaN(start.getTime()) && now < start) return false;
    }

    if (b.endDate) {
      const end = new Date(b.endDate);
      if (!isNaN(end.getTime()) && now > end) return false;
    }

    return true;
  });

  // Rotate if multiple active banners
  useEffect(() => {
    if (activeTopBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeTopBanners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeTopBanners.length]);

  // Adjust current index if it goes out of bounds
  useEffect(() => {
    if (currentIndex >= activeTopBanners.length && activeTopBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeTopBanners.length, currentIndex]);

  // Hide on admin routes or when not mounted yet or if no active banners
  if (!mounted || pathname?.startsWith("/admin") || activeTopBanners.length === 0) {
    return null;
  }

  const currentBanner = activeTopBanners[currentIndex] || activeTopBanners[0];
  if (!currentBanner) return null;

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem("alsayyedah_dismissed_banners", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving dismissed banner to localStorage:", e);
    }
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-50 w-full text-xs sm:text-sm font-medium transition-colors duration-300 shadow-2xs"
      style={{
        backgroundColor: currentBanner.bgColor || "#C9A96E",
        color: currentBanner.textColor || "#FFFFFF",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-2 flex items-center justify-between min-h-[38px] relative">
        {/* Left spacer or multiple banner arrow controls */}
        <div className="hidden sm:flex items-center space-x-1 w-16">
          {activeTopBanners.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prev) => (prev - 1 + activeTopBanners.length) % activeTopBanners.length
                  )
                }
                className="p-1 rounded opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % activeTopBanners.length)
                }
                className="p-1 rounded opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Center: Banner Text and Optional Button */}
        <div className="flex-1 flex flex-wrap items-center justify-center text-center gap-x-2.5 gap-y-1 px-2">
          <span className="tracking-wide">{currentBanner.text}</span>

          {currentBanner.buttonText && currentBanner.link && (
            <Link
              href={currentBanner.link}
              className="inline-flex items-center font-semibold text-xs px-2.5 py-0.5 rounded-full transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs"
              style={{
                backgroundColor:
                  currentBanner.textColor === "#FFFFFF"
                    ? "rgba(255, 255, 255, 0.25)"
                    : "rgba(0, 0, 0, 0.12)",
                color: currentBanner.textColor || "#FFFFFF",
              }}
            >
              <span>{currentBanner.buttonText}</span>
              <span className="ml-1 text-[11px]">→</span>
            </Link>
          )}
        </div>

        {/* Right: Close button */}
        <div className="flex items-center justify-end w-16">
          <button
            onClick={() => handleDismiss(currentBanner.id)}
            className="p-1 rounded-md opacity-75 hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Close banner announcement"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
