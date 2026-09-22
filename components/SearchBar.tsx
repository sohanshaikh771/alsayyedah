"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, ArrowRight, ShoppingBag, TrendingUp } from "lucide-react";
import { Product, getAllProducts } from "@/lib/products-firestore";
import { Category, getActiveCategories } from "@/lib/categories-firestore";

const defaultCategories: { id: string; name: string; slug: string; image?: string }[] = [
  { id: "abaya", name: "Abaya", slug: "abaya" },
  { id: "burkha", name: "Burkha", slug: "burkha" },
  { id: "niqab", name: "Niqab", slug: "niqab" },
  { id: "hijab", name: "Hijab", slug: "hijab" },
];

const trendingSearches = [
  "Abaya",
  "Burkha",
  "Niqab",
  "Hijab",
  "Bridal Abaya",
  "Black Niqab",
];

export default function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; image?: string }[]>(defaultCategories);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Fetch categories & prefetch products
  useEffect(() => {
    getActiveCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch((err) => console.warn("Failed to load categories for search:", err));
  }, []);

  // Focus input when modal opens & lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);

      // Preload products
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
      setLoading(false);
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
          const catMatch = p.category?.toLowerCase().includes(trimmed);
          const fabricMatch = p.fabric?.toLowerCase().includes(trimmed);
          return nameMatch || catMatch || fabricMatch;
        });

        setResults(filtered.slice(0, 10));
      } catch (err) {
        console.error("Search query error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

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
        className="p-1.5 md:p-2 min-w-[36px] min-h-[36px] md:min-w-[40px] md:min-h-[40px] hover:bg-beige rounded-full text-taupe hover:text-gold transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-center group"
        aria-label="Search products"
        title="Search (Ctrl + K)"
      >
        <Search className="w-[18px] h-[18px] md:w-5 md:h-5 transition-transform duration-200 group-hover:scale-110" />
      </button>

      {/* Premium Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-10 w-full max-w-2xl mt-12 sm:mt-20 bg-cream rounded-xl border border-sand shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Top search input row */}
              <div className="flex items-center gap-3 p-4 sm:p-5 md:p-6 border-b border-sand bg-cream">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-taupe/50 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDownInput}
                  placeholder="Search for abaya, burkha, niqab..."
                  className="flex-1 bg-transparent outline-none text-taupe placeholder:text-taupe/40 font-sans text-base sm:text-lg md:text-xl font-medium"
                />

                {loading && (
                  <Loader2 className="w-5 h-5 animate-spin text-gold flex-shrink-0" />
                )}

                {query && !loading && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1 text-taupe/40 hover:text-taupe transition-colors cursor-pointer text-xs"
                    aria-label="Clear input"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-beige hover:bg-sand text-taupe/70 hover:text-taupe transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="overflow-y-auto max-h-[60vh]">
                {/* 1. INITIAL STATE: When query is empty */}
                {!query.trim() && (
                  <div className="divide-y divide-sand/50">
                    {/* A) TRENDING SEARCHES */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-3.5 h-3.5 text-gold" />
                        <p className="text-xs tracking-[0.2em] text-gold uppercase font-semibold font-sans">
                          Trending Searches
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sand bg-beige/50 text-taupe text-xs sm:text-sm hover:border-gold hover:bg-gold/10 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>🔥</span>
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* B) SHOP BY CATEGORY */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                        <p className="text-xs tracking-[0.2em] text-gold uppercase font-semibold font-sans">
                          Shop by Category
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {categories.slice(0, 4).map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?c=${cat.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-beige/70 hover:bg-sand/60 transition-colors group border border-sand/40 hover:border-gold/40"
                          >
                            <div className="w-10 h-10 rounded-md bg-sand/70 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {cat.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <ShoppingBag className="w-4 h-4 text-taupe/40 group-hover:text-gold transition-colors" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-taupe group-hover:text-gold transition-colors truncate">
                              {cat.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LOADING STATE: Skeleton loaders */}
                {query.trim() && loading && (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-lg bg-beige/40 animate-pulse border border-sand/30"
                      >
                        <div className="w-12 h-16 sm:w-14 sm:h-16 rounded-md bg-sand/60 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-sand/60 rounded w-3/4" />
                          <div className="h-3 bg-sand/40 rounded w-1/2" />
                          <div className="h-3 bg-sand/50 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. RESULTS FOUND */}
                {query.trim() && !loading && results.length > 0 && (
                  <div className="p-3 divide-y divide-sand/40">
                    <p className="text-xs text-taupe/60 px-3 py-2 font-medium">
                      Found {results.length} result{results.length !== 1 ? "s" : ""}
                    </p>
                    {results.map((product) => {
                      const imgSrc = product.images?.[0] || `/products/${product.slug}-1.jpg`;
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 sm:gap-4 p-3 rounded-lg hover:bg-beige transition-colors group cursor-pointer"
                        >
                          <div className="w-12 h-16 sm:w-14 sm:h-16 rounded-md overflow-hidden bg-sand/60 border border-sand flex-shrink-0 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgSrc}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-sm sm:text-base text-taupe truncate group-hover:text-gold transition-colors font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-taupe/60 mt-0.5 capitalize">
                              {product.category} • {product.fabric}
                            </p>
                            <p className="text-sm font-semibold text-taupe mt-1">
                              ₹{product.price.toLocaleString("en-IN")}
                              {product.mrp && product.mrp > product.price && (
                                <span className="text-xs text-taupe/40 line-through ml-2 font-normal">
                                  ₹{product.mrp.toLocaleString("en-IN")}
                                </span>
                              )}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-taupe/30 group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* 4. NO RESULTS FOUND */}
                {query.trim() && !loading && results.length === 0 && (
                  <div className="p-10 sm:p-12 text-center">
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 text-taupe/20 mx-auto mb-3" />
                    <p className="font-serif text-lg sm:text-xl text-taupe font-medium">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs sm:text-sm text-taupe/60 mt-1.5 max-w-xs mx-auto">
                      Try a different keyword or browse categories above.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2.5 bg-beige/60 border-t border-sand/60 flex items-center justify-between text-[11px] text-taupe/50 font-sans">
                <span className="hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 bg-cream border border-sand rounded text-[10px] font-mono">ESC</kbd> to close, <kbd className="px-1.5 py-0.5 bg-cream border border-sand rounded text-[10px] font-mono">↵</kbd> to select
                </span>
                <span className="sm:hidden">
                  Tap outside or ✕ to close
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  Powered by <span className="font-serif text-taupe/80 font-semibold">ALSayyedah</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
