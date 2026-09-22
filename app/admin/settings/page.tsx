"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  StoreSettings,
  defaultSettings,
  getStoreSettings,
} from "@/lib/settings-firestore";
import toast from "react-hot-toast";
import { Save, Loader2, Check, Store, Share2, Truck } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    getStoreSettings()
      .then((data) => setSettings(data))
      .catch((err) => {
        console.error("Failed to load store settings from Firestore:", err);
        toast.error("Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "store"), settings, { merge: true });
      setSaved(true);
      toast.success("Settings saved", { id: "store-settings" });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Failed to save settings", { id: "store-settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-taupe space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <p className="font-serif text-lg">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-sand">
        <div>
          <h1 className="font-serif text-3xl text-taupe font-medium tracking-wide">
            Settings
          </h1>
          <p className="text-sm text-taupe/70 mt-1">
            Manage store information and preferences
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-md font-sans text-sm font-medium tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
              saved
                ? "bg-emerald-700 text-white"
                : "bg-taupe text-cream hover:bg-gold"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* A. STORE INFORMATION */}
        <section className="bg-cream border border-sand rounded-md p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-sand/60 pb-3">
            <Store className="w-4 h-4 text-gold" />
            <h2 className="font-serif text-base font-semibold text-taupe tracking-wide">
              A. Store Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="ALSayyedah"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors font-serif italic"
                placeholder="Your Modest Identity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="+91 99258 37795"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="support@alsayyedah.in"
              />
            </div>
          </div>
        </section>

        {/* B. SOCIAL LINKS */}
        <section className="bg-cream border border-sand rounded-md p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-sand/60 pb-3">
            <Share2 className="w-4 h-4 text-gold" />
            <h2 className="font-serif text-base font-semibold text-taupe tracking-wide">
              B. Social Links
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="https://instagram.com/alsayyedah.in"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                WhatsApp Number
                <span className="text-xs text-taupe/60 ml-2 font-normal">
                  (Format: 919925837795 without + or spaces)
                </span>
              </label>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="919925837795"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Facebook URL
                <span className="text-xs text-taupe/50 ml-2 font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="https://facebook.com/alsayyedah"
              />
            </div>
          </div>
        </section>

        {/* C. SHIPPING & CHARGES */}
        <section className="bg-cream border border-sand rounded-md p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-sand/60 pb-3">
            <Truck className="w-4 h-4 text-gold" />
            <h2 className="font-serif text-base font-semibold text-taupe tracking-wide">
              C. Shipping & Charges
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Free Shipping Above (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe/60 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={settings.freeShippingAbove || 0}
                  onChange={(e) =>
                    handleChange("freeShippingAbove", Number(e.target.value) || 0)
                  }
                  className="w-full bg-cream border border-sand rounded-md pl-7 pr-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                  placeholder="1999"
                />
              </div>
              <p className="text-xs text-taupe/60 mt-1">
                Orders equal or above this get free delivery.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Shipping Charge (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe/60 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={settings.shippingCharge || 0}
                  onChange={(e) =>
                    handleChange("shippingCharge", Number(e.target.value) || 0)
                  }
                  className="w-full bg-cream border border-sand rounded-md pl-7 pr-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                  placeholder="99"
                />
              </div>
              <p className="text-xs text-taupe/60 mt-1">
                Standard delivery fee for orders below threshold.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                COD Charges (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe/60 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={settings.codCharge || 0}
                  onChange={(e) =>
                    handleChange("codCharge", Number(e.target.value) || 0)
                  }
                  className="w-full bg-cream border border-sand rounded-md pl-7 pr-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                  placeholder="49"
                />
              </div>
              <p className="text-xs text-taupe/60 mt-1">
                Additional fee applied when choosing Cash on Delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 rounded-md font-sans text-sm font-medium tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
              saved
                ? "bg-emerald-700 text-white"
                : "bg-taupe text-cream hover:bg-gold"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
