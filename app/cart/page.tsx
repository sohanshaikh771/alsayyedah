"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumButton from "@/components/PremiumButton";
import { useCart } from "@/lib/cart-store";
import toast from "react-hot-toast";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQty, removeItem, totalPrice } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = totalPrice();
  const isFreeShipping = subtotal >= 1999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const codFee = 49;
  const total = subtotal + shippingFee + codFee;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="font-serif text-4xl text-taupe mb-8">Your Cart</h1>

        {!mounted ? (
          <div className="py-20" />
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-beige/50 rounded-lg border border-sand/40 p-8">
            <h2 className="font-serif text-3xl text-taupe mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-taupe/70 mb-6">
              Discover our modest collection and add items to your cart.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-taupe text-cream px-6 py-3 rounded-md hover:bg-gold transition font-medium"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="bg-beige p-4 sm:p-5 rounded-md flex gap-4 items-center border border-sand/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded flex-shrink-0 bg-sand/30"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg text-taupe font-medium truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-taupe/70 mt-0.5">
                      Size: <span className="font-medium text-taupe">{item.size}</span> • Color: <span className="font-medium text-taupe">{item.color}</span>
                    </p>
                    <p className="font-semibold text-taupe mt-1.5">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.size,
                            item.color,
                            Math.max(1, item.qty - 1)
                          )
                        }
                        className="w-7 h-7 border border-sand rounded flex items-center justify-center text-taupe hover:border-gold hover:text-gold transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-taupe px-1 min-w-6 text-center">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.size,
                            item.color,
                            item.qty + 1
                          )
                        }
                        className="w-7 h-7 border border-sand rounded flex items-center justify-center text-taupe hover:border-gold hover:text-gold transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.productId, item.size, item.color);
                      toast("Item removed", { icon: "🗑️", id: "cart-remove" });
                    }}
                    className="text-taupe/50 hover:text-red-600 transition p-2 cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="bg-beige border border-sand rounded-lg p-6 space-y-4">
              <h2 className="font-serif text-2xl text-taupe pb-2 border-b border-sand/50">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-sm text-taupe/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-taupe">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span>Shipping</span>
                    {!isFreeShipping && (
                      <p className="text-[11px] text-taupe/60">
                        Add ₹{(1999 - subtotal).toLocaleString("en-IN")} more for FREE shipping
                      </p>
                    )}
                  </div>
                  <span className={`font-medium ${isFreeShipping ? "text-emerald-700" : "text-taupe"}`}>
                    {isFreeShipping ? "FREE" : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span>COD Charges</span>
                    <span className="text-[11px] text-taupe/60 block">Cash on delivery fee</span>
                  </div>
                  <span className="font-medium text-taupe">₹{codFee}</span>
                </div>

                <div className="border-t border-sand/70 pt-3 flex justify-between items-baseline text-taupe">
                  <span className="text-base font-semibold">Total</span>
                  <span className="font-serif text-2xl font-bold text-taupe">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-3">
                <PremiumButton
                  href="/checkout"
                  variant="primary"
                  size="md"
                  className="w-full py-3.5 gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </PremiumButton>

                <div className="text-center">
                  <Link
                    href="/shop"
                    className="inline-block text-sm text-taupe/80 hover:text-gold transition font-medium underline underline-offset-4"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
