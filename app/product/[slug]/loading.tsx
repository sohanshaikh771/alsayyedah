import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <ProductDetailSkeleton />
      </main>
      <Footer />
    </div>
  );
}
