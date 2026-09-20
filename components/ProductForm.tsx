"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CheckCircle2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { getActiveCategories, Category } from "@/lib/categories-firestore";

export interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  price: number | "";
  mrp?: number | "";
  fabric: string;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number | "";
  featured: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  productId?: string;
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "Free"];

export default function ProductForm({
  initialData,
  productId,
}: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState(
    Boolean(initialData?.slug)
  );
  const [category, setCategory] = useState<string>(
    initialData?.category || ""
  );
  const [price, setPrice] = useState<number | "">(
    initialData?.price !== undefined ? initialData.price : ""
  );
  const [mrp, setMrp] = useState<number | "">(
    initialData?.mrp !== undefined ? initialData.mrp : ""
  );
  const [fabric, setFabric] = useState(initialData?.fabric || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [images, setImages] = useState<string[]>(
    initialData?.images || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialData?.sizes || []
  );
  const [colorsText, setColorsText] = useState(
    initialData?.colors?.join(", ") || ""
  );
  const [stock, setStock] = useState<number | "">(
    initialData?.stock !== undefined ? initialData.stock : ""
  );
  const [featured, setFeatured] = useState<boolean>(
    initialData?.featured || false
  );

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setIsSlugManual(Boolean(initialData.slug));
      if (initialData.category) setCategory(initialData.category);
      setPrice(initialData.price !== undefined ? initialData.price : "");
      setMrp(initialData.mrp !== undefined ? initialData.mrp : "");
      setFabric(initialData.fabric || "");
      setDescription(initialData.description || "");
      setImages(initialData.images || []);
      setSelectedSizes(initialData.sizes || []);
      setColorsText(initialData.colors?.join(", ") || "");
      setStock(initialData.stock !== undefined ? initialData.stock : "");
      setFeatured(initialData.featured || false);
    }
  }, [initialData]);

  useEffect(() => {
    getActiveCategories()
      .then((data) => {
        setCategories(data);
        setLoadingCategories(false);
      })
      .catch(() => setLoadingCategories(false));
  }, []);

  // Auto-generate slug from name if not manually modified
  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(e.target.value);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!slug.trim()) newErrors.slug = "Product slug is required";
    if (!category.trim()) newErrors.category = "Category is required";
    if (price === "" || isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Valid price is required (>= 0)";
    }
    if (
      mrp !== "" &&
      (isNaN(Number(mrp)) || Number(mrp) < Number(price || 0))
    ) {
      newErrors.mrp = "MRP must be greater than or equal to price";
    }
    if (!fabric.trim()) newErrors.fabric = "Fabric material is required";
    if (!description.trim())
      newErrors.description = "Product description is required";
    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = "Valid stock count is required (>= 0)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSuccessMessage(null);

    const parsedColors = colorsText
      .split(",")
      .map((col) => col.trim())
      .filter((col) => col.length > 0);

    const finalSlug = slug.trim() || generateSlug(name);

    const productPayload = {
      name: name.trim(),
      slug: finalSlug,
      category,
      price: Number(price),
      mrp: mrp !== "" ? Number(mrp) : null,
      fabric: fabric.trim(),
      description: description.trim(),
      images,
      sizes: selectedSizes,
      colors: parsedColors,
      stock: Number(stock),
      featured,
      updatedAt: serverTimestamp(),
    };

    try {
      if (productId) {
        // Edit existing product
        const docRef = doc(db, "products", productId);
        await updateDoc(docRef, productPayload);
        setSuccessMessage("Product updated successfully!");
      } else {
        // Add new product
        await addDoc(collection(db, "products"), {
          ...productPayload,
          createdAt: serverTimestamp(),
        });
        setSuccessMessage("Product created successfully!");
      }

      setTimeout(() => {
        router.push("/admin/products");
      }, 750);
    } catch (err) {
      console.error("Failed to save product:", err);
      setErrors({ form: "Failed to save product. Please check connection and try again." });
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-sand rounded-xl p-4 sm:p-8 shadow-xs space-y-6"
    >
      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {errors.form}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid: Name & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Noor Embroidered Abaya"
            className="w-full bg-cream border border-sand rounded-md px-3 py-2.5 text-base sm:text-sm min-h-[44px] text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            Slug / URL Identifier <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder="e.g. noor-embroidered-abaya"
            className="w-full bg-cream border border-sand rounded-md px-3 py-2.5 text-base sm:text-sm min-h-[44px] text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
          />
          {errors.slug && (
            <p className="text-xs text-red-600 mt-1">{errors.slug}</p>
          )}
          <p className="text-[11px] text-taupe/60 mt-1">
            Auto-generated from name. You can customize if needed.
          </p>
        </div>
      </div>

      {/* Grid: Category, Fabric */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-cream border border-sand rounded-md px-3 py-2.5 text-base sm:text-sm min-h-[44px] text-taupe focus:border-gold focus:outline-none transition-colors"
            disabled={loadingCategories}
          >
            <option value="">
              {loadingCategories ? "Loading..." : "Select category"}
            </option>
            {category && !categories.some((cat) => cat.slug === category) && (
              <option value={category} className="text-taupe/60">
                {category.charAt(0).toUpperCase() + category.slice(1)} (inactive)
              </option>
            )}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-600 mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            Fabric Material <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            placeholder="e.g. Korean Nida, Saudi Crepe, Chiffon"
            className="w-full bg-cream border border-sand rounded-md px-3 py-2.5 text-base sm:text-sm min-h-[44px] text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
          />
          {errors.fabric && (
            <p className="text-xs text-red-600 mt-1">{errors.fabric}</p>
          )}
        </div>
      </div>

      {/* Grid: Price, MRP, Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            Selling Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="e.g. 1899"
            className="w-full bg-cream border border-sand rounded-md px-3 py-2.5 text-base sm:text-sm min-h-[44px] text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
          />
          {errors.price && (
            <p className="text-xs text-red-600 mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            MRP (₹) <span className="text-taupe/50 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={mrp}
            onChange={(e) =>
              setMrp(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="e.g. 2499"
            className="w-full bg-cream border border-sand rounded-md px-3 py-2.5 text-base sm:text-sm min-h-[44px] text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
          />
          {errors.mrp && (
            <p className="text-xs text-red-600 mt-1">{errors.mrp}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
            Stock Units <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="e.g. 25"
            className="w-full bg-cream border border-sand rounded-md px-3 py-2.5 text-base sm:text-sm min-h-[44px] text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
          />
          {errors.stock && (
            <p className="text-xs text-red-600 mt-1">{errors.stock}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the silhouette, drape, craftmanship, and occasion appropriateness..."
          className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
        />
        {errors.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Product Images */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-2">
          Product Images
        </label>
        <ImageUploader value={images} onChange={setImages} maxImages={6} />
      </div>

      {/* Available Sizes Toggle Group */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-taupe">
            Available Sizes
          </label>
          {selectedSizes.length > 0 && (
            <span className="text-xs text-taupe/70 font-sans">
              Selected: <span className="font-semibold text-taupe">{selectedSizes.join(", ")}</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {AVAILABLE_SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={
                  isSelected
                    ? "px-4 py-2 rounded-md border bg-taupe text-cream border-taupe transition-colors cursor-pointer text-xs font-medium"
                    : "px-4 py-2 rounded-md border bg-cream text-taupe border-sand hover:border-gold transition-colors cursor-pointer text-xs font-medium"
                }
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
          Available Colors <span className="text-taupe/50 font-normal">(Comma separated)</span>
        </label>
        <input
          type="text"
          value={colorsText}
          onChange={(e) => setColorsText(e.target.value)}
          placeholder="e.g. Black, Beige, Sand, Taupe"
          className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none transition-colors"
        />
      </div>

      {/* Featured Toggle Switch */}
      <div className="pt-2 border-t border-sand/60 flex items-center justify-between">
        <div>
          <span className="block text-sm font-medium text-taupe">
            Featured Product
          </span>
          <span className="block text-xs text-taupe/60">
            Showcase this product prominently on the homepage and at the top of collections
          </span>
        </div>

        <button
          type="button"
          onClick={() => setFeatured(!featured)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            featured ? "bg-gold" : "bg-sand"
          }`}
          role="switch"
          aria-checked={featured}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              featured ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Buttons at bottom */}
      <div className="pt-4 border-t border-sand flex items-center justify-end gap-3">
        <Link
          href="/admin/products"
          className="border border-sand text-taupe px-5 py-2.5 rounded-md hover:bg-beige transition-colors font-medium text-sm text-center"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 bg-taupe text-cream px-6 py-2.5 rounded-md hover:bg-gold transition-colors font-medium text-sm shadow-xs disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{submitting ? "Saving..." : productId ? "Update Product" : "Save Product"}</span>
        </button>
      </div>
    </form>
  );
}
