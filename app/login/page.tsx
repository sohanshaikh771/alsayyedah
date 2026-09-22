"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Check, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, loginGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginGoogle();
      router.push("/");
    } catch (err: unknown) {
      console.error("Google login failed:", err);
      setError("Sign in with Google failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cream via-beige to-sand p-6 text-center">
        <div className="max-w-md w-full bg-cream rounded-xl shadow-lg border border-sand p-8">
          <p className="font-italiana text-3xl text-taupe tracking-[0.12em] mb-1">
            ALSayyedah
          </p>
          <p className="font-amiri text-lg text-gold/70 mb-6" dir="rtl">
            السيدة
          </p>
          <h1 className="font-serif text-2xl text-taupe mb-2">
            You are already logged in
          </h1>
          <p className="text-sm text-taupe/70 mb-6">
            Redirecting you to the home page...
          </p>
          <Link
            href="/"
            className="inline-block bg-taupe text-cream px-6 py-3 rounded-md hover:bg-gold transition font-medium text-sm shadow-sm"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-beige to-sand flex">
      {/* LEFT COLUMN — Brand Visual (hidden on mobile, lg:flex) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sand via-beige to-cream" />

        {/* Decorative Arabic calligraphy watermark */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <p className="font-amiri text-[200px] text-gold/10 leading-none" dir="rtl">
            السيدة
          </p>
        </div>

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <Link href="/" className="group inline-block">
            <p className="font-italiana text-5xl text-taupe tracking-[0.15em] group-hover:text-gold transition-colors duration-300">
              ALSayyedah
            </p>
          </Link>
          <p className="font-serif italic text-xl text-taupe/60 mt-3">
            Your Modest Identity
          </p>
          <div className="w-16 h-[2px] bg-gold my-8" />
          <p className="text-taupe/70 max-w-sm leading-relaxed font-sans text-sm sm:text-base">
            Premium modest fashion crafted with love. Sign in to track orders, save addresses, and enjoy exclusive offers.
          </p>

          {/* Trust badges */}
          <div className="mt-12 space-y-3.5 text-sm text-taupe/70 text-left font-sans">
            <p className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-gold flex-shrink-0" />
              <span>Secure Google Sign-In</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-gold flex-shrink-0" />
              <span>Track all your orders</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-gold flex-shrink-0" />
              <span>Save addresses for faster checkout</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* RIGHT COLUMN — Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10"
      >
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block group">
              <p className="font-italiana text-3xl text-taupe tracking-[0.12em] group-hover:text-gold transition-colors">
                ALSayyedah
              </p>
              <p className="font-amiri text-base text-gold/70 mt-1" dir="rtl">
                السيدة
              </p>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center lg:text-left mb-8">
            <p className="text-xs tracking-[0.3em] text-gold uppercase mb-3 font-semibold font-sans">
              WELCOME BACK
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-taupe tracking-tight">
              Login to your account
            </h1>
            <p className="text-taupe/60 mt-2 text-sm font-sans">
              Sign in to continue shopping or track your orders
            </p>
          </div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-cream rounded-xl shadow-lg border border-sand p-6 md:p-8"
          >
            {error && (
              <div className="mb-5 text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center font-sans">
                {error}
              </div>
            )}

            {/* Google Sign In — premium button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-sand hover:border-gold bg-cream hover:bg-beige py-3.5 sm:py-4 rounded-lg transition-all duration-300 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs hover:shadow-sm"
            >
              <FcGoogle className="w-5 h-5 flex-shrink-0" />
              <span className="text-taupe font-medium text-sm sm:text-base font-sans">
                {loading ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-sand" />
              <span className="text-xs text-taupe/40 uppercase tracking-wider font-semibold font-sans">
                OR
              </span>
              <div className="flex-1 h-px bg-sand" />
            </div>

            {/* Phone OTP — coming soon */}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 border border-sand bg-beige/50 py-3.5 sm:py-4 rounded-lg cursor-not-allowed opacity-60"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-taupe/40 flex-shrink-0" />
              <span className="text-taupe/50 font-medium text-xs sm:text-sm font-sans">
                Phone Login — Coming Soon
              </span>
            </button>

            {/* Small note */}
            <p className="text-xs text-taupe/50 text-center mt-4 font-sans">
              We&apos;ll never share your details. 100% secure.
            </p>
          </motion.div>

          {/* Continue as guest */}
          <div className="text-center mt-8">
            <Link
              href="/shop"
              className="text-sm text-taupe hover:text-gold transition inline-flex items-center gap-2 group font-medium font-sans"
            >
              <span>Continue shopping as guest</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-xs text-taupe/40 text-center mt-10 sm:mt-12 font-sans">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-taupe/60 underline hover:text-taupe transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-taupe/60 underline hover:text-taupe transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
