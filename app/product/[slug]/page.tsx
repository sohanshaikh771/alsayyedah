import React, { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailClient from "@/components/ProductDetailClient";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";

export const revalidate = 0;

interface ProductPageProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const formattedSlug = resolvedParams.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${formattedSlug} — ALSayyedah`,
    description: "Handcrafted luxury modest fashion garment delivered across India.",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailClient slug={resolvedParams.slug} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}