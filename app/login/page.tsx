"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 w-full flex flex-col items-center justify-center text-center">
          <h1 className="font-serif text-3xl text-taupe mb-4">
            You are already logged in
          </h1>
          <p className="text-sm text-taupe/70 mb-6">
            Redirecting to home...
          </p>
          <Link
            href="/"
            className="bg-taupe text-cream px-6 py-3 rounded-md hover:bg-gold transition font-medium text-sm"
          >
            Go to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto px-4 py-20 w-full">
        <h1 className="font-serif text-3xl text-taupe text-center mb-1">
          Login / Sign Up
        </h1>
        <p className="font-amiri text-2xl text-gold/70 text-center mb-6" dir="rtl">
          السيدة
        </p>

        {/* White/cream card */}
        <div className="bg-white/80 p-6 sm:p-8 rounded-md border border-sand shadow-2xs">
          {error && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded text-center">
              {error}
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-sand py-3 rounded-md hover:bg-beige transition bg-cream text-taupe text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FcGoogle className="w-5 h-5 flex-shrink-0" />
            <span>{loading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-sand" />
            <span className="text-taupe/40 text-sm">OR</span>
            <div className="flex-1 h-px bg-sand" />
          </div>

          {/* Info Box */}
          <p className="text-xs text-taupe/60 text-center">
            Phone OTP login coming soon. Use Google for now.
          </p>
        </div>

        {/* Below Card Link */}
        <div className="text-center mt-6">
          <Link
            href="/shop"
            className="text-xs text-taupe/70 hover:text-taupe transition"
          >
            Continue shopping as guest →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
