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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Grid: 2 columns on mobile (Brand spans 2), 4 columns on desktop */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10 text-left">
          {/* Brand — full width on mobile (col-span-2 lg:col-span-2) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-start">
            <Link href="/" className="inline-block group">
              <div>
                <div className="flex items-baseline gap-2.5 sm:gap-3">
                  <h3 className="font-italiana text-2xl sm:text-3xl text-cream tracking-[0.15em] group-hover:text-gold transition-colors duration-300">
                    ALSayyedah
                  </h3>
                  <span className="font-amiri text-xl sm:text-2xl text-gold/80 group-hover:text-gold transition-colors duration-300" dir="rtl">
                    السيدة
                  </span>
                </div>
                <p className="font-serif italic text-cream/60 text-xs sm:text-sm mt-1.5 sm:mt-2">
                  Your Modest Identity
                </p>
              </div>
            </Link>

            <p className="text-cream/70 text-xs md:text-sm mt-3 md:mt-4 max-w-xs md:max-w-sm font-sans leading-relaxed">
              Premium modest fashion crafted with love for the modern woman. Delivered across India.
            </p>

            {/* Social icons row */}
            <div className="flex items-center gap-2.5 sm:gap-3 mt-5 md:mt-6">
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
              >
                <FaInstagram className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
              <a
                href={BRAND.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
              >
                <FaWhatsapp className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-taupe transition-all duration-300 flex items-center justify-center"
              >
                <FaFacebookF className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </a>
            </div>

            {/* Order on WhatsApp button */}
            <div className="mt-5 md:mt-6 w-full sm:w-auto">
              <a
                href={BRAND.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gold text-gold px-4 py-2 rounded-md hover:bg-gold hover:text-taupe transition-all duration-300 text-sm font-medium inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[40px]"
              >
                <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links (50% on mobile, 1 col on desktop) */}
          <div className="flex flex-col items-start">
            <h4 className="text-xs font-semibold tracking-[0.15em] text-gold uppercase mb-3 sm:mb-4 font-sans">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 md:space-y-3 text-sm text-cream/70 font-sans flex flex-col items-start">
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

          {/* Get in Touch (50% on mobile, 1 col on desktop) */}
          <div className="flex flex-col items-start">
            <h4 className="text-xs font-semibold tracking-[0.15em] text-gold uppercase mb-3 sm:mb-4 font-sans">
              GET IN TOUCH
            </h4>
            <div className="space-y-2 md:space-y-3 text-sm text-cream/70 font-sans flex flex-col items-start">
              <div>
                <span className="block text-xs text-cream/50">WhatsApp / Call:</span>
                <a
                  href={`https://wa.me/${BRAND.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-cream hover:text-gold transition-colors"
                >
                  +91 99258 37795
                </a>
              </div>
              <div>
                <span className="block text-xs text-cream/50">Email:</span>
                <a
                  href="mailto:hello@alsayyedah.in"
                  className="text-sm text-cream hover:text-gold transition-colors break-all sm:break-normal"
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
        <div className="border-t border-cream/10 mt-10 md:mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-cream/50 font-sans text-center sm:text-left">
          <p>© 2025 ALSayyedah. All rights reserved.</p>
          <p>
            Made with <span className="text-red-400">♥</span> in India
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
