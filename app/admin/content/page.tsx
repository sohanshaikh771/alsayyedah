"use client";

import React, { useState, useEffect } from "react";
import {
  getSiteContent,
  updateSiteContent,
  defaultContent,
  SiteContent,
} from "@/lib/content-firestore";
import { Loader2, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader";

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await getSiteContent();
        setContent(data);
      } catch (err) {
        console.error("Failed to load site content:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      await updateSiteContent(content);
      setSaving(false);
      setSaved(true);
      toast.success("Content updated", { id: "admin-content" });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save site content:", err);
      toast.error("Failed to save content", { id: "admin-content" });
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SiteContent, value: string) => {
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-taupe space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <p className="font-serif text-lg">Loading site content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-sand">
        <div>
          <h1 className="font-serif text-3xl text-taupe font-medium tracking-wide">
            Site Content
          </h1>
          <p className="text-sm text-taupe/70 mt-1">Manage homepage text</p>
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
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. HERO SECTION */}
        <section className="bg-cream border border-sand rounded-md p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-sand/60 pb-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <h2 className="font-serif text-base font-semibold text-taupe tracking-wide">
              1. Hero Section
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Hero Label
              </label>
              <input
                type="text"
                value={content.heroLabel}
                onChange={(e) => handleChange("heroLabel", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="e.g. MODEST FASHION"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Hero Heading
                <span className="text-xs text-taupe/50 ml-2 font-normal">
                  (use \n for line break)
                </span>
              </label>
              <textarea
                rows={2}
                value={content.heroHeading}
                onChange={(e) => handleChange("heroHeading", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors font-serif"
                placeholder={"Your Modest\nIdentity"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Hero Subtext
              </label>
              <textarea
                rows={2}
                value={content.heroSubtext}
                onChange={(e) => handleChange("heroSubtext", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors font-sans"
                placeholder="Premium Burkha, Abaya, Niqab & Hijab..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Hero Images (1-4)
              </label>
              <ImageUploader
                value={content.heroImages || []}
                onChange={(urls) =>
                  setContent({ ...content, heroImages: urls })
                }
                maxImages={4}
              />
              <p className="text-xs text-taupe/60 mt-2 font-sans">
                Upload 1-4 images for the hero section (right side on desktop, below text on mobile). They will auto-slide every 5 seconds. Recommended: 800x1000px portrait orientation.
              </p>
            </div>
          </div>
        </section>

        {/* 2. CATEGORIES SECTION */}
        <section className="bg-cream border border-sand rounded-md p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-sand/60 pb-3">
            <h2 className="font-serif text-base font-semibold text-taupe tracking-wide">
              2. Categories Section
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-taupe mb-1">
              Categories Title
            </label>
            <input
              type="text"
              value={content.categoriesTitle}
              onChange={(e) => handleChange("categoriesTitle", e.target.value)}
              className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
              placeholder="Shop by Category"
            />
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS SECTION */}
        <section className="bg-cream border border-sand rounded-md p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-sand/60 pb-3">
            <h2 className="font-serif text-base font-semibold text-taupe tracking-wide">
              3. Featured Products Section
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-taupe mb-1">
              Featured Title
            </label>
            <input
              type="text"
              value={content.featuredTitle}
              onChange={(e) => handleChange("featuredTitle", e.target.value)}
              className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
              placeholder="Featured Products"
            />
          </div>
        </section>

        {/* 4. BRAND STORY SECTION */}
        <section className="bg-cream border border-sand rounded-md p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-sand/60 pb-3">
            <h2 className="font-serif text-base font-semibold text-taupe tracking-wide">
              4. Brand Story Section
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Story Label
              </label>
              <input
                type="text"
                value={content.storyLabel}
                onChange={(e) => handleChange("storyLabel", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors"
                placeholder="OUR STORY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Story Heading
              </label>
              <input
                type="text"
                value={content.storyHeading}
                onChange={(e) => handleChange("storyHeading", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors font-serif"
                placeholder="ALSayyedah"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Story Paragraph 1
              </label>
              <textarea
                rows={3}
                value={content.storyParagraph1}
                onChange={(e) => handleChange("storyParagraph1", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Story Paragraph 2
              </label>
              <textarea
                rows={3}
                value={content.storyParagraph2}
                onChange={(e) => handleChange("storyParagraph2", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Story Tagline
              </label>
              <input
                type="text"
                value={content.storyTagline}
                onChange={(e) => handleChange("storyTagline", e.target.value)}
                className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none transition-colors font-serif italic"
                placeholder="Your Modest Identity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-taupe mb-1">
                Brand Story Images (1-5)
              </label>
              <ImageUploader
                value={content.storyImages || []}
                onChange={(urls) =>
                  setContent({
                    ...content,
                    storyImages: urls,
                    storyImage: urls[0] || "",
                  })
                }
                maxImages={5}
              />
              <p className="text-xs text-taupe/60 mt-1.5 font-sans">
                Upload 1-5 images. They will auto-slide every 4 seconds on the homepage. Recommended: 800x1000px portrait.
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
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
