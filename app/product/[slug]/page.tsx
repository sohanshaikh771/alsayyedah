import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { products } from "@/lib/products-data";

interface ProductPageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const product = products.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    return {
      title: "Product Not Found — ALSayyedah",
      description: "The requested modest fashion design could not be found.",
    };
  }

  return {
    title: `${product.name} — ALSayyedah`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const product = products.find((p) => p.slug === resolvedParams.slug);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {product ? (
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
        ) : (
          <div className="py-24 text-center space-y-5 bg-beige/40 rounded-lg border border-sand/60 max-w-lg mx-auto px-6">
            <h1 className="font-serif text-3xl text-taupe">
              Product Not Found
            </h1>
            <p className="text-sm text-taupe/70 font-sans leading-relaxed">
              We couldn’t find the modest fashion garment you were looking for. It
              may have been retired or moved.
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
        )}
      </main>

      <Footer />
    </div>
  );
}
