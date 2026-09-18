"use client";

import React, { useState } from "react";
import { subscribeToNewsletter } from "@/lib/newsletter-firestore";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage("");

    const result = await subscribeToNewsletter(email, "homepage");

    if (result.success) {
      setMessage("Thanks for subscribing! Check your email for the coupon code.");
      setIsError(false);
      setEmail("");
    } else {
      setMessage(result.error || "Something went wrong. Try again.");
      setIsError(true);
    }
    setLoading(false);
  };

  return (
    <section className="bg-beige py-16 border-t border-sand/40">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* 1. Small label */}
        <span className="text-xs font-semibold tracking-widest text-gold uppercase block">
          STAY UPDATED
        </span>

        {/* 2. Heading */}
        <h2 className="font-serif text-3xl sm:text-4xl text-taupe tracking-wide mt-2">
          Get 10% Off Your First Order
        </h2>

        {/* 3. Subtext */}
        <p className="text-sm sm:text-base text-taupe/70 mt-3 max-w-lg mx-auto font-sans leading-relaxed">
          Join our newsletter for exclusive offers, new collections, and styling
          tips. We&apos;ll send you a coupon code right away.
        </p>

        {/* 4. Form */}
        <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (message) setMessage("");
              }}
              className="flex-1 bg-cream border border-sand rounded-md px-4 py-3 text-taupe placeholder:text-taupe/40 focus:border-gold focus:outline-none text-sm font-sans transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-taupe text-cream px-6 py-3 rounded-md hover:bg-gold transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs flex-shrink-0"
            >
              {loading ? "Joining..." : "Subscribe"}
            </button>
          </div>

          {/* 5. Message */}
          {message && (
            <p
              className={`text-sm mt-3 font-sans ${
                isError ? "text-red-600" : "text-green-600 font-medium"
              }`}
            >
              {message}
            </p>
          )}

          {/* 6. Small privacy note */}
          <p className="text-xs text-taupe/50 mt-3 font-sans">
            No spam, ever. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </section>
  );
}
