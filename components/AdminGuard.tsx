"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-taupe">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg text-taupe">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-taupe">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg text-taupe">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream text-taupe px-4">
        <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-xl shadow-sm border border-sand">
          <div className="w-12 h-12 rounded-full bg-sand/30 text-taupe flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6 text-gold" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl text-taupe">Access Denied</h1>
            <p className="text-sm text-taupe/70">
              You do not have permission to access the admin panel.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-taupe text-cream text-sm font-medium rounded hover:bg-taupe/90 transition-colors shadow-xs"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
