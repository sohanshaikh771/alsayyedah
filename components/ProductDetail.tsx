"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Minus, Plus, Truck, Banknote, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Product } from "@/lib/products-firestore";
import { BRAND } from "@/lib/constants";
import { useCart } from "@/lib/cart-store";
import PremiumButton from "@/components/PremiumButton";
import SizeGuideModal from "@/components/SizeGuideModal";
import WishlistButton from "@/components/WishlistButton";
import ProductReviews from "./ProductReviews";
import ReviewForm from "./ReviewForm";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const hasDiscount = Boolean(product.mrp && product.mrp > product.price);
  const discountPercent =
    hasDiscount && product.mrp
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleImageError = (index: number) => {
    setImageErrorMap((prev) => ({ ...prev, [index]: true }));
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      qty: quantity,
    });
    toast.success(
      (t) => (
        <span className="flex items-center gap-2">
          <span>Added to cart!</span>
          <Link
            href="/cart"
            onClick={() => toast.dismiss(t.id)}
            className="text-xs bg-gold text-white font-medium px-2 py-0.5 rounded hover:bg-gold/90 transition ml-1 inline-block"
          >
            View Cart
          </Link>
        </span>
      ),
      {
        icon: "🛒",
        id: "cart",
      }
    );
  };

  const orderMessage = `Hi ${BRAND.name}! I would like to order:
• Product: ${product.name}
• Size: ${selectedSize || "Standard"}
• Color: ${selectedColor || "Standard"}
• Quantity: ${quantity}
• Total Price: ₹${(product.price * quantity).toLocaleString("en-IN")}

Please let me know how to proceed with payment and shipping.`;

  const whatsappOrderUrl = `${BRAND.whatsappLink}?text=${encodeURIComponent(orderMessage)}`;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
      {/* LEFT COLUMN: Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-sand/40 border border-sand/60">
          {!imageErrorMap[selectedImageIndex] ? (
            <Image
              src={product.images[selectedImageIndex] || `/products/${product.slug}-1.jpg`}
              alt={`${product.name} - View ${selectedImageIndex + 1}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
              onError={() => handleImageError(selectedImageIndex)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-beige p-6 text-center">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-taupe/35 mb-3"
                aria-hidden="true"
              >
                <path
                  d="M32 8C21 8 16 17 16 27C16 38 20 46 24 56H40C44 46 48 38 48 27C48 17 43 8 32 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25 24C25 27.5 28 30 32 30C36 30 39 27.5 39 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 38C26 42 38 42 44 38"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-serif text-base tracking-wide text-taupe/70 italic capitalize">
                {product.category}
              </span>
              <span className="text-xs text-taupe/50 mt-1">{product.fabric}</span>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-3 right-3">
              <span className="rounded bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
                {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails Row */}
        {product.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.images.map((imgSrc, idx) => {
              const isActive = selectedImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 bg-sand/30 transition-all ${
                    isActive
                      ? "border-gold shadow-sm scale-105"
                      : "border-transparent hover:border-sand"
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  {!imageErrorMap[idx] ? (
                    <Image
                      src={imgSrc}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      onError={() => handleImageError(idx)}
                    />
                  ) : (
                    <div className="w-full h-full bg-beige flex items-center justify-center text-[10px] text-taupe/60 uppercase font-serif">
                      Photo {idx + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Product Details */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gold block mb-2">
            {product.category}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-taupe tracking-tight leading-tight">
            {product.name}
          </h1>
          <p className="text-sm text-taupe/60 mt-1.5 font-sans">
            Fabric: <span className="font-medium text-taupe/80">{product.fabric}</span>
          </p>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-3 pt-1 border-b border-sand/60 pb-5">
          <span className="text-2xl sm:text-3xl font-bold text-taupe">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {hasDiscount && product.mrp && (
            <span className="text-base sm:text-lg text-taupe/50 line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          {hasDiscount && (
            <span className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
              {discountPercent}% off
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-taupe/80 text-sm sm:text-base font-sans leading-relaxed">
          {product.description}
        </p>

        {/* SIZE SELECTION */}
        {product.sizes && product.sizes.length > 0 ? (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-taupe">
                Size: <span className="text-gold capitalize">{selectedSize}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="text-xs text-taupe underline hover:text-gold cursor-pointer transition-colors"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] px-3.5 py-2 text-sm font-medium rounded-md border transition-all ${
                      isSelected
                        ? "bg-taupe text-cream border-taupe shadow-sm"
                        : "bg-cream text-taupe border-sand hover:border-gold hover:text-gold"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-taupe">
                Size: <span className="text-gold capitalize">Free Size</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="text-xs text-taupe underline hover:text-gold cursor-pointer transition-colors"
              >
                Size Guide
              </button>
            </div>
          </div>
        )}

        {/* COLOR SELECTION */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-taupe block mb-2.5">
              Color: <span className="text-gold capitalize">{selectedColor}</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm font-medium rounded-md border transition-all ${
                      isSelected
                        ? "bg-taupe text-cream border-taupe shadow-sm"
                        : "bg-cream text-taupe border-sand hover:border-gold hover:text-gold"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* QUANTITY SECTION */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-taupe block mb-2.5">
            Quantity
          </label>
          <div className="flex items-center border border-sand rounded-md w-fit bg-cream shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
              className="p-2.5 text-taupe hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-sm font-semibold text-taupe select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
              disabled={quantity >= 10}
              className="p-2.5 text-taupe hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <PremiumButton
              onClick={handleAddToCart}
              variant="primary"
              size="md"
              className="flex-1 py-3.5"
            >
              Add to Cart
            </PremiumButton>

            <WishlistButton
              product={product}
              variant="icon"
              className="w-12 h-12 border border-sand rounded-md bg-cream hover:bg-beige flex-shrink-0"
            />
          </div>

          <PremiumButton
            href={whatsappOrderUrl}
            target="_blank"
            variant="outline"
            size="md"
            className="w-full py-3.5 gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Order on WhatsApp</span>
          </PremiumButton>
        </div>

        {/* HIGHLIGHTS & TRUST BADGES */}
        <div className="pt-6 border-t border-sand/60 space-y-3 font-sans text-xs text-taupe/80">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
            <span>
              Premium Quality Fabric: <strong className="text-taupe">{product.fabric}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-gold flex-shrink-0" />
            <span>Free shipping on all orders across India above ₹1,999</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Banknote className="w-4 h-4 text-gold flex-shrink-0" />
            <span>Cash on Delivery (COD) Available Nationwide</span>
          </div>
        </div>
      </motion.div>
    </div>

    {/* REVIEWS SECTION */}
    <section className="mt-16 border-t border-sand pt-12">
      <ProductReviews 
        productId={product.id} 
        productSlug={product.slug} 
      />
      
      <div className="mt-8">
        <ReviewForm 
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
        />
      </div>
    </section>

    {/* SIZE GUIDE MODAL */}
    <SizeGuideModal
      isOpen={showSizeGuide}
      onClose={() => setShowSizeGuide(false)}
      category={product.category}
    />
  </div>
  );
}
