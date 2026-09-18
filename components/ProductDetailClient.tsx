"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, getProductBySlug } from "@/lib/products-firestore";
import ProductDetail from "@/components/ProductDetail";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProductBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load product detail:", err);
        if (isMounted) {
          setProduct(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="py-24 text-center space-y-5 bg-beige/40 rounded-lg border border-sand/60 max-w-lg mx-auto px-6">
        <h1 className="font-serif text-3xl text-taupe">Product Not Found</h1>
        <p className="text-sm text-taupe/70 font-sans leading-relaxed">
          We couldn’t find the modest fashion garment you were looking for. It may have been retired or moved.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-taupe text-cream rounded-md text-sm font-medium hover:bg-taupe/90 transition-colors shadow-sm"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-taupe/60 mb-8">
        <Link href="/" className="hover:text-gold transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/shop?c=${product.category}`}
          className="hover:text-gold capitalize transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-taupe font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <ProductDetail product={product} />
    </div>
  );
}
