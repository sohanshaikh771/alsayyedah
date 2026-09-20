"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { BRAND } from "@/lib/constants";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="bg-taupe text-cream border-t border-gold/20 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main 3-Column Grid (Brand lg:col-span-2, Quick Links lg:col-span-1, Get in Touch lg:col-span-1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 text-center md:text-left">
          {/* COLUMN 1 — Brand (lg:col-span-2) */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col items-center md:items-start">
            <Link href="/" className="inline-block group">
              <div>
                <div className="flex items-baseline gap-3 justify-center md:justify-start">
                  <h3 className="font-italiana text-3xl text-cream tracking-[0.15em] group-hover:text-gold transition-colors duration-300">
                    ALSayyedah
                  </h3>
                  <span className="font-amiri text-2xl text-gold/80 group-hover:text-gold transition-colors duration-300" dir="rtl">
                    السيدة
                  </span>
                </div>
                <p className="font-serif italic text-cream/60 text-sm mt-2">
                  Your Modest Identity
                </p>
              </div>
            </Link>

            <p className="text-cream/70 text-sm mt-4 max-w-sm font-sans mx-auto md:mx-0 leading-relaxed">
              Premium modest fashion crafted with love for the modern woman. Delivered across India.
            </p>

            {/* Social icons row */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href={BRAND.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
            </div>

            {/* Order on WhatsApp button */}
            <div className="mt-6">
              <a
                href={BRAND.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gold text-gold px-4 py-2 rounded-md hover:bg-gold hover:text-taupe transition-all duration-300 text-sm font-medium inline-flex items-center gap-2 min-h-[44px]"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* COLUMN 2 — Quick Links (lg:col-span-1) */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase mb-4 font-sans">
              QUICK LINKS
            </h4>
            <ul className="space-y-3 text-sm text-cream/70 font-sans flex flex-col items-center md:items-start">
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  Shop All
                </Link>
              </li>
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
                <a
                  href={BRAND.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3 — Get in Touch (lg:col-span-1) */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase mb-4 font-sans">
              GET IN TOUCH
            </h4>
            <div className="space-y-3 text-sm text-cream/70 font-sans flex flex-col items-center md:items-start">
              <div>
                <span className="block text-xs text-cream/50">WhatsApp / Call:</span>
                <a
                  href={`https://wa.me/${BRAND.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-cream/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-cream/50 font-sans">
          <p>© 2025 ALSayyedah. All rights reserved.</p>
          <p>
            Made with <span className="text-red-400">♥</span> in India
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
