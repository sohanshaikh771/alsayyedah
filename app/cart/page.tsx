"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-store";
import { BRAND } from "@/lib/constants";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, updateQty, removeItem, totalPrice } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const message =
    "Hi ALSayyedah! I want to order:\n\n" +
    items
      .map(
        (i) =>
          `• ${i.name} (${i.size}, ${i.color}) x${i.qty} = ₹${i.price * i.qty}`
      )
      .join("\n") +
    `\n\nTotal: ₹${totalPrice()}\n\nPlease confirm.`;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="font-serif text-4xl text-taupe mb-8">Your Cart</h1>

        {!mounted ? (
          <div className="py-20" />
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="font-serif text-3xl text-taupe mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-taupe/70 mb-6">
              Start shopping to add items
            </p>
            <Link
              href="/shop"
              className="inline-block bg-taupe text-cream px-6 py-3 rounded-md hover:bg-gold transition"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="bg-beige p-4 rounded-md flex gap-4 items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg text-taupe">{item.name}</h3>
                    <p className="text-sm text-taupe/60">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="font-semibold text-taupe mt-1">₹{item.price}</p>
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
                        className="w-7 h-7 border border-sand rounded flex items-center justify-center text-taupe hover:border-gold transition"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-taupe px-1">
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
                        className="w-7 h-7 border border-sand rounded flex items-center justify-center text-taupe hover:border-gold transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.productId, item.size, item.color)
                    }
                    className="text-taupe/60 hover:text-red-500 transition p-2"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-sand pt-6 mt-8">
              <div className="flex justify-between text-lg font-semibold mb-6 text-taupe">
                <span>Total</span>
                <span>₹{totalPrice()}</span>
              </div>

              <a
                href={`${BRAND.whatsappLink}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-taupe text-cream py-3 rounded-md hover:bg-gold transition flex items-center justify-center gap-2 font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Checkout on WhatsApp</span>
              </a>

              <p className="text-xs text-taupe/60 mt-3 text-center">
                Payment link will be sent on WhatsApp. COD also available.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
