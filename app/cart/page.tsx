"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumButton from "@/components/PremiumButton";
import { useCart } from "@/lib/cart-store";
import { BRAND } from "@/lib/constants";
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

  const waCartMessage = encodeURIComponent(
    `Hi ${BRAND.name}! I would like to order my cart items:\n\n` +
    items.map((i) => `• ${i.name} (${i.size}, ${i.color}) x${i.qty} = ₹${i.price * i.qty}`).join("\n") +
    `\n\nTotal: ₹${total}\nPlease assist with order confirmation.`
  );
  const waCartUrl = `${BRAND.whatsappLink}?text=${waCartMessage}`;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        <h1 className="font-serif text-3xl sm:text-4xl text-taupe mb-6 sm:mb-8">Your Cart</h1>

        {!mounted ? (
          <div className="py-20" />
        ) : items.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-beige/50 rounded-lg border border-sand/40 p-6 sm:p-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-taupe mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-taupe/70 mb-6">
              Discover our modest collection and add items to your cart.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-taupe text-cream px-6 py-3 min-h-[44px] rounded-md hover:bg-gold transition font-medium text-sm"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items List */}
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="bg-beige p-3.5 sm:p-5 rounded-md flex gap-3 sm:gap-4 items-center border border-sand/40"
                >
                  {/* Smaller image on mobile: w-16 h-20 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded flex-shrink-0 bg-sand/30"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base sm:text-lg text-taupe font-medium truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-taupe/70 mt-0.5">
                      Size: <span className="font-medium text-taupe">{item.size}</span> • Color: <span className="font-medium text-taupe">{item.color}</span>
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-taupe mt-1">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                    {/* Quantity Controls (min 36px buttons) */}
                    <div className="flex items-center gap-1 sm:gap-2 mt-2">
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
                        className="w-9 h-9 min-w-[36px] min-h-[36px] border border-sand rounded flex items-center justify-center text-taupe hover:border-gold hover:text-gold transition cursor-pointer text-base bg-cream active:scale-95"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-taupe px-1.5 min-w-7 text-center">
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
                        className="w-9 h-9 min-w-[36px] min-h-[36px] border border-sand rounded flex items-center justify-center text-taupe hover:border-gold hover:text-gold transition cursor-pointer text-base bg-cream active:scale-95"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button with larger touch target (min 40x40) */}
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.productId, item.size, item.color);
                      toast("Item removed", { icon: "🗑️", id: "cart-remove" });
                    }}
                    className="text-taupe/50 hover:text-red-600 transition w-10 h-10 min-w-[40px] min-h-[40px] rounded-md hover:bg-sand/30 flex items-center justify-center cursor-pointer flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="bg-beige border border-sand rounded-lg p-5 sm:p-6 space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl text-taupe pb-2 border-b border-sand/50">
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
                  className="w-full py-3.5 min-h-[44px] gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </PremiumButton>

                {/* WhatsApp Button Full-Width */}
                <a
                  href={waCartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border-2 border-taupe text-taupe py-3.5 px-4 rounded-md hover:bg-taupe hover:text-cream transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm min-h-[44px] group"
                >
                  <FaWhatsapp className="w-5 h-5 text-[#25D366] group-hover:text-cream transition-colors" />
                  <span>Order on WhatsApp</span>
                </a>

                <div className="text-center pt-1">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center min-h-[44px] px-4 text-sm text-taupe/80 hover:text-gold transition font-medium underline underline-offset-4"
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
