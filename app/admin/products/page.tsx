"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth, db } from "@/lib/firebase";
import { Plus, Pencil, Trash2, Star, Package } from "lucide-react";
import toast from "react-hot-toast";

interface ProductItem {
  id: string;
  name: string;
  category?: string;
  price?: number;
  mrp?: number;
  stock?: number;
  images?: string[];
  image?: string;
  featured?: boolean;
  createdAt?: unknown;
}

export default function AdminProductsPage() {
  useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    // Listen to "products" collection in real-time
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ProductItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ProductItem, "id">),
        }));

        // Sort: featured first, then by createdAt desc
        const sorted = items.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;

          const getTime = (val: unknown) => {
            if (!val) return 0;
            if (typeof val === "object" && val !== null) {
              const obj = val as Record<string, unknown>;
              if (typeof obj.toMillis === "function") return (obj.toMillis as () => number)();
              if (typeof obj.seconds === "number") return obj.seconds * 1000;
            }
            if (val instanceof Date) return val.getTime();
            return 0;
          };

          return getTime(b.createdAt) - getTime(a.createdAt);
        });

        setProducts(sorted);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        // Fallback without orderBy in case index or field missing on initial setup
        const fallbackSub = onSnapshot(productsRef, (fallbackSnapshot) => {
          const items: ProductItem[] = fallbackSnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ProductItem, "id">),
          }));
          const sorted = items.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return 0;
          });
          setProducts(sorted);
          setLoading(false);
        });
        return () => fallbackSub();
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(
      `Delete this product?${name ? ` ("${name}")` : ""}`
    );
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted", { id: "admin-product" });
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product. Please try again.", { id: "admin-product" });
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      setUpdatingId(id);
      await updateDoc(doc(db, "products", id), {
        featured: !currentFeatured,
      });
      toast.success("Updated", { id: "admin-product" });
    } catch (err) {
      console.error("Failed to update featured status:", err);
      toast.error("Could not update featured status.", { id: "admin-product" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-taupe font-medium tracking-tight">
            Products
          </h1>
          <p className="text-sm text-taupe/70 mt-1">
            Manage your boutique inventory, pricing, and showcase status
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-taupe text-cream px-4 py-2 rounded-md hover:bg-gold transition-colors font-medium text-sm shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white border border-sand rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-taupe font-medium">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-sand rounded-xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-beige flex items-center justify-center text-gold mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl text-taupe font-medium mb-2">
            No products yet
          </h2>
          <p className="text-sm text-taupe/70 max-w-md mb-6">
            Your inventory is currently empty. Get started by adding your first luxury
            abaya, burkha, niqab, or hijab.
          </p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 bg-taupe text-cream px-5 py-2.5 rounded-md hover:bg-gold transition-colors font-medium text-sm shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Product</span>
          </Link>
        </div>
      ) : (
        /* Products List */
        <div className="space-y-3">
          {products.map((product) => {
            const firstImage =
              (product.images && product.images.length > 0
                ? product.images[0]
                : product.image) || null;
            const isLowStock =
              typeof product.stock === "number" && product.stock < 5;
            const isFeatured = !!product.featured;

            return (
              <div
                key={product.id}
                className="bg-cream border border-sand rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-shadow hover:shadow-xs"
              >
                {/* Left: Product Image Thumbnail */}
                <div className="w-16 h-20 rounded-md bg-sand flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded-md bg-sand"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-md bg-beige flex items-center justify-center text-taupe font-serif text-xl font-bold uppercase select-none">
                      {product.name ? product.name.charAt(0) : "P"}
                    </div>
                  )}
                </div>

                {/* Middle: Product Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-lg text-taupe font-medium truncate">
                      {product.name}
                    </h2>
                    {product.category && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-medium text-taupe">
                        ₹{product.price?.toLocaleString() ?? 0}
                      </span>
                      {product.mrp && product.mrp > (product.price ?? 0) && (
                        <span className="text-xs text-taupe/50 line-through">
                          ₹{product.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <span className="text-sand hidden sm:inline">•</span>

                    <span
                      className={`text-sm ${
                        isLowStock ? "text-red-600 font-medium" : "text-taupe/70"
                      }`}
                    >
                      Stock: {product.stock ?? 0}
                      {isLowStock && (
                        <span className="ml-1 text-xs text-red-500 font-normal">
                          (Low)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Featured Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(product.id, isFeatured)}
                    disabled={updatingId === product.id}
                    title={
                      isFeatured ? "Featured product (click to unfeature)" : "Mark as featured"
                    }
                    className="p-2 rounded-md hover:bg-beige text-taupe transition-colors"
                    aria-label="Toggle featured"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        isFeatured
                          ? "fill-gold text-gold"
                          : "text-taupe/40 hover:text-gold"
                      }`}
                    />
                  </button>

                  {/* Edit Button */}
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="p-2 rounded-md hover:bg-beige text-taupe/80 hover:text-taupe transition-colors"
                    title="Edit Product"
                    aria-label="Edit Product"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 rounded-md hover:bg-red-50 text-taupe/70 hover:text-red-600 transition-colors"
                    title="Delete Product"
                    aria-label="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
