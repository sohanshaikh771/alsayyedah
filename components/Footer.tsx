import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { BRAND } from "@/lib/constants";

export default function Footer() {
  const shopLinks = [
    { label: "Abaya", href: "/shop?c=abaya" },
    { label: "Burkha", href: "/shop?c=burkha" },
    { label: "Niqab", href: "/shop?c=niqab" },
    { label: "Hijab", href: "/shop?c=hijab" },
  ];

  return (
    <footer className="bg-beige border-t border-sand mt-auto text-taupe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <h3 className="font-serif text-2xl tracking-wide text-taupe">
              {BRAND.name}
            </h3>
            <p className="text-sm font-sans tracking-wider text-taupe/80">
              {BRAND.tagline}
            </p>
          </div>

          {/* Col 2: Shop Links */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
              Shop
            </h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-taupe hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Social & Contact */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold">
              Connect
            </h4>
            <div className="flex items-center space-x-4">
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 bg-cream rounded-full border border-sand text-taupe hover:text-gold hover:border-gold transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href={BRAND.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="p-2 bg-cream rounded-full border border-sand text-taupe hover:text-gold hover:border-gold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-sand/60 text-center">
          <p className="font-sans text-xs text-taupe/70 tracking-wide">
            &copy; 2025 ALSayyedah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
