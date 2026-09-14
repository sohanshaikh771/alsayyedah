import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products-data";

export const metadata = {
  title: "Shop Modest Collection — ALSayyedah",
  description:
    "Explore our handcrafted collection of luxury Abayas, Burkhas, Niqabs & Hijabs. Delivered across India.",
};

interface ShopPageProps {
  searchParams?:
    | { [key: string]: string | string[] | undefined }
    | Promise<{ [key: string]: string | string[] | undefined }>;
}

const filterOptions = [
  { label: "All", value: "all", href: "/shop" },
  { label: "Abaya", value: "abaya", href: "/shop?c=abaya" },
  { label: "Burkha", value: "burkha", href: "/shop?c=burkha" },
  { label: "Niqab", value: "niqab", href: "/shop?c=niqab" },
  { label: "Hijab", value: "hijab", href: "/shop?c=hijab" },
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams =
    searchParams instanceof Promise ? await searchParams : searchParams;

  const rawParam =
    typeof resolvedParams?.c === "string"
      ? resolvedParams.c.toLowerCase()
      : Array.isArray(resolvedParams?.c)
      ? resolvedParams.c[0]?.toLowerCase()
      : undefined;

  const activeCategory =
    rawParam && ["abaya", "burkha", "niqab", "hijab"].includes(rawParam)
      ? rawParam
      : "all";

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (product) => product.category.toLowerCase() === activeCategory
        );

  const pageTitle =
    activeCategory === "all"
      ? "All Products"
      : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-taupe tracking-tight capitalize">
            {pageTitle}
          </h1>
          <p className="mt-2 text-sm text-taupe/70 font-sans">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "design" : "designs"}
          </p>
        </div>

        {/* Filter Pills Row */}
        <div className="flex gap-3 flex-wrap mb-10">
          {filterOptions.map((option) => {
            const isActive = activeCategory === option.value;
            return (
              <Link
                key={option.value}
                href={option.href}
                className={`px-5 py-2 rounded-full border text-sm font-medium tracking-wide transition-colors ${
                  isActive
                    ? "bg-taupe text-cream border-taupe shadow-sm"
                    : "bg-cream text-taupe border-sand hover:border-gold hover:text-gold"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        {/* Products Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4 bg-beige/40 rounded-lg border border-sand/60 max-w-xl mx-auto px-6">
            <h3 className="font-serif text-2xl text-taupe">
              No products found in this category
            </h3>
            <p className="text-sm text-taupe/70 font-sans max-w-md mx-auto">
              We could not find any items matching your selected filter. Explore our complete collection to discover more modest couture.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-taupe text-cream rounded-md text-sm font-medium hover:bg-taupe/90 transition-colors shadow-sm"
              >
                View All Products
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
