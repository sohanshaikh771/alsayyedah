"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, AlertCircle } from "lucide-react";
import ProductForm, { ProductFormData } from "@/components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [product, setProduct] = useState<Partial<ProductFormData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        setLoading(true);
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            name: data.name || "",
            slug: data.slug || "",
            category: data.category || "",
            price: data.price ?? "",
            mrp: data.mrp ?? "",
            fabric: data.fabric || "",
            description: data.description || "",
            images: data.images || (data.image ? [data.image] : []),
            sizes: data.sizes || [],
            colors: data.colors || [],
            stock: data.stock ?? "",
            featured: Boolean(data.featured),
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load product for editing:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-sand rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-taupe font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-taupe/70 hover:text-gold transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>

        <div className="bg-white border border-sand rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-taupe font-medium mb-2">
            Product not found
          </h2>
          <p className="text-sm text-taupe/70 max-w-md mx-auto mb-6">
            The product you are trying to edit could not be found or has been deleted.
          </p>
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center bg-taupe text-cream px-5 py-2.5 rounded-md hover:bg-gold transition-colors font-medium text-sm shadow-xs"
          >
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

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
          Edit Product
        </h1>
        <p className="text-sm text-taupe/70 mt-1">
          Update inventory details, pricing, images, and showcase flags
        </p>
      </div>

      {/* Product Form with Initial Data */}
      <ProductForm initialData={product} productId={id} />
    </div>
  );
}
