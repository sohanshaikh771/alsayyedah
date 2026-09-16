import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/ProductForm";

export const metadata = {
  title: "Add New Product — Admin | ALSayyedah",
};

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link & Header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-taupe/70 hover:text-gold transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
        <h1 className="font-serif text-3xl text-taupe tracking-tight">
          Add New Product
        </h1>
        <p className="text-sm text-taupe/70 mt-1">
          Create a new luxury modest wear listing in your catalog
        </p>
      </div>

      {/* Product Form */}
      <ProductForm />
    </div>
  );
}
