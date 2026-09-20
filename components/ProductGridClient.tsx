"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, getAllProducts, getProductsByCategory } from "@/lib/products-firestore";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

interface ProductGridClientProps {
  category?: string;
  initialProducts?: Product[];
}

export default function ProductGridClient({
  category = "all",
  initialProducts,
}: ProductGridClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState<boolean>(!initialProducts);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchCategoryProducts = async () => {
      try {
        const data =
          category === "all" || !category
            ? await getAllProducts()
            : await getProductsByCategory(category);

        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load products for category:", category, err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [category]);

  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center space-y-4 bg-beige/40 rounded-lg border border-sand/60 max-w-xl mx-auto px-6">
        <h3 className="font-serif text-2xl text-taupe">
          No products found in this category
        </h3>
        <p className="text-sm text-taupe/70 font-sans max-w-md mx-auto leading-relaxed">
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
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
