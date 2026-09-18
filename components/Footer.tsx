"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { BRAND } from "@/lib/constants";
import SizeGuideModal from "@/components/SizeGuideModal";

export default function Footer() {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="bg-taupe text-cream border-t border-gold/20 mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* COLUMN 1 — Brand */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <span className="font-serif text-3xl text-cream tracking-wide block">
                  {BRAND.name}
                </span>
                <span className="text-cream/60 font-serif italic text-sm mt-1 block">
                  {BRAND.tagline}
                </span>
              </Link>
              <p className="text-cream/70 text-sm leading-relaxed max-w-xs font-sans">
                Premium modest fashion crafted with love for the modern woman.
              </p>
              {/* Social icons row */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={BRAND.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="w-9 h-9 rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a
                  href={BRAND.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with us on WhatsApp"
                  className="w-9 h-9 rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="w-9 h-9 rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
                >
                  <FaFacebookF className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* COLUMN 2 — Shop */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase mb-4 font-sans">
                SHOP
              </h4>
              <ul className="space-y-2.5 text-sm text-cream/70 font-sans">
                <li>
                  <Link href="/shop" className="hover:text-gold transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/shop?c=abaya" className="hover:text-gold transition-colors">
                    Abaya
                  </Link>
                </li>
                <li>
                  <Link href="/shop?c=burkha" className="hover:text-gold transition-colors">
                    Burkha
                  </Link>
                </li>
                <li>
                  <Link href="/shop?c=niqab" className="hover:text-gold transition-colors">
                    Niqab
                  </Link>
                </li>
                <li>
                  <Link href="/shop?c=hijab" className="hover:text-gold transition-colors">
                    Hijab
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-gold transition-colors">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3 — Help */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase mb-4 font-sans">
                HELP
              </h4>
              <ul className="space-y-2.5 text-sm text-cream/70 font-sans">
                <li>
                  <Link href="/track" className="hover:text-gold transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-gold transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:text-gold transition-colors">
                    My Wishlist
                  </Link>
                </li>
                <li>
                  <a
                    href={BRAND.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="hover:text-gold transition-colors text-left cursor-pointer"
                  >
                    Size Guide
                  </button>
                </li>
                <li>
                  <a
                    href={BRAND.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    Order on WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 4 — Get in Touch */}
            <div>
              <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase mb-4 font-sans">
                GET IN TOUCH
              </h4>
              <div className="space-y-3 text-sm text-cream/70 font-sans">
                <div>
                  <span className="block text-xs text-cream/50">WhatsApp / Call:</span>
                  <a
                    href={`tel:${BRAND.whatsapp}`}
                    className="text-cream hover:text-gold transition-colors font-medium"
                  >
                    +91 99258 37795
                  </a>
                </div>
                <div>
                  <span className="block text-xs text-cream/50">Email:</span>
                  <a
                    href="mailto:hello@alsayyedah.in"
                    className="text-cream hover:text-gold transition-colors"
                  >
                    hello@alsayyedah.in
                  </a>
                </div>
                <p className="text-xs text-cream/50 pt-1">
                  Mon-Sat, 10 AM - 8 PM
                </p>

                {/* Small CTA button */}
                <div className="pt-2">
                  <a
                    href={BRAND.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-gold text-gold px-4 py-2 rounded-md hover:bg-gold hover:text-taupe transition-all duration-300 text-xs uppercase tracking-wider font-medium"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>Chat with us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER + BOTTOM BAR */}
          <div className="border-t border-cream/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/50 font-sans">
            <p>© 2025 ALSayyedah. All rights reserved.</p>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span>
                Made with <span className="text-red-400">♥</span> in India
              </span>
              <span className="text-cream/20">|</span>
              <div className="flex items-center gap-1.5 text-[10px] text-cream/60">
                <span className="px-2 py-0.5 rounded bg-cream/10 border border-cream/10">
                  COD
                </span>
                <span className="px-2 py-0.5 rounded bg-cream/10 border border-cream/10">
                  UPI
                </span>
                <span className="px-2 py-0.5 rounded bg-cream/10 border border-cream/10">
                  Cards
                </span>
                <span className="px-2 py-0.5 rounded bg-cream/10 border border-cream/10">
                  NetBanking
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </>
  );
}
