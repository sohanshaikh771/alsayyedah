"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { BRAND } from "@/lib/constants";

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Hide on all /admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const prefilledMessage =
    "Hi ALSayyedah! I'm interested in your collection. Can you help me?";
  const whatsappUrl = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    prefilledMessage
  )}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-40 flex items-center group"
    >
      {/* Label tooltip on hover (desktop only) */}
      <div className="hidden md:block mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-taupe text-cream px-3 py-1.5 rounded-md text-xs whitespace-nowrap shadow-md">
          Chat with us
        </div>
      </div>

      {/* Floating WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with ALSayyedah on WhatsApp"
        className="relative w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer focus:outline-none"
      >
        {/* Gentle pulse ring around button (subtle gold color, slow ping) */}
        <span className="absolute -inset-1 rounded-full bg-gold/40 animate-ping opacity-60 [animation-duration:3s] pointer-events-none" />

        {/* WhatsApp Icon */}
        <span className="relative z-10 flex items-center justify-center">
          <FaWhatsapp className="w-7 h-7 text-white" />
        </span>
      </a>
    </motion.div>
  );
}
