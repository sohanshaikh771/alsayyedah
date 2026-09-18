"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { Product, getAllProducts } from "@/lib/products-firestore";

export default function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens & lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      // Preload all products
      getAllProducts()
        .then((data) => setAllProducts(data))
        .catch((err) => console.error("Failed to load products for search:", err));

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        let list = allProducts;
        if (list.length === 0) {
          list = await getAllProducts();
          setAllProducts(list);
        }

        const filtered = list.filter((p) => {
          const nameMatch = p.name.toLowerCase().includes(trimmed);
          const catMatch = p.category.toLowerCase().includes(trimmed);
          const fabricMatch = p.fabric.toLowerCase().includes(trimmed);
          return nameMatch || catMatch || fabricMatch;
        });

        setResults(filtered.slice(0, 10));
      } catch (err) {
        console.error("Search query error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, allProducts]);

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results.length > 0) {
      router.push(`/product/${results[0].slug}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Search trigger button in navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-beige rounded-full text-taupe hover:text-gold transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center group"
        aria-label="Search products"
        title="Search"
      >
        <Search className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 w-full max-w-lg mt-16 sm:mt-20 bg-cream rounded-lg border border-sand shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Top search input bar */}
              <div className="flex items-center gap-2 p-4 border-b border-sand bg-cream">
                <Search className="w-5 h-5 text-taupe/50 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDownInput}
                  placeholder="Start typing to search..."
                  className="flex-1 bg-transparent outline-none text-taupe placeholder:text-taupe/40 font-sans text-sm sm:text-base"
                />
                {loading && (
                  <Loader2 className="w-4 h-4 animate-spin text-gold flex-shrink-0 mr-1" />
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-taupe/60 hover:text-taupe hover:bg-beige transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results / Empty area */}
              <div className="overflow-y-auto max-h-[60vh] p-3">
                {/* 1. When query is empty -> Show popular categories */}
                {!query.trim() && (
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-taupe/60 mb-3">
                      Popular Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Abaya", href: "/shop?c=abaya" },
                        { label: "Burkha", href: "/shop?c=burkha" },
                        { label: "Niqab", href: "/shop?c=niqab" },
                        { label: "Hijab", href: "/shop?c=hijab" },
                      ].map((cat) => (
                        <Link
                          key={cat.label}
                          href={cat.href}
                          onClick={() => setIsOpen(false)}
                          className="px-3.5 py-1.5 bg-beige hover:bg-sand/70 text-taupe hover:text-gold rounded-full text-xs font-medium border border-sand transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. When query has results */}
                {query.trim() && results.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-taupe/50">
                      Products ({results.length})
                    </div>
                    {results.map((product) => (
                      <SearchResultItem
                        key={product.id}
                        product={product}
                        onSelect={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                )}

                {/* 3. When query has no results and not loading */}
                {query.trim() && !loading && results.length === 0 && (
                  <div className="py-12 text-center text-taupe/70">
                    <p className="font-serif text-base text-taupe">
                      No products found
                    </p>
                    <p className="text-xs text-taupe/60 mt-1">
                      Try searching with different keywords like fabric or category.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SearchResultItem({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = product.images?.[0] || `/products/${product.slug}-1.jpg`;

  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={onSelect}
      className="flex items-center gap-3.5 p-2 rounded-md hover:bg-beige transition-colors group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-12 h-16 rounded bg-sand/60 overflow-hidden flex-shrink-0 border border-sand">
        {!imgError ? (
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand/40 text-[9px] text-taupe/60 uppercase font-serif">
            {product.category}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-sm font-medium text-taupe group-hover:text-gold transition-colors truncate">
          {product.name}
        </h4>
        <p className="text-xs text-taupe/60 capitalize mt-0.5">
          {product.category} • {product.fabric}
        </p>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <span className="text-sm font-semibold text-taupe group-hover:text-gold transition-colors">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
      </div>
    </Link>
  );
}
