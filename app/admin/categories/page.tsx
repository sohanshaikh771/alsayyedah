"use client";

import React, { useState, useEffect } from "react";
import {
  listenCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/categories-firestore";
import ImageUploader from "@/components/ImageUploader";
import { Plus, Pencil, Trash2, GripVertical, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
}

export default function AdminCategoriesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Modal Form State
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    order: 1,
    active: true,
  });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    const unsubscribe = listenCategories((items) => {
      setCategories(items);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleOpenAdd = () => {
    const nextOrder =
      categories.length > 0
        ? Math.max(...categories.map((c) => Number(c.order) || 0)) + 1
        : 1;

    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      order: nextOrder,
      active: true,
    });
    setIsSlugManuallyEdited(false);
    setFormError("");
    setShowModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      order: typeof category.order === "number" ? category.order : 1,
      active: category.active !== false,
    });
    setIsSlugManuallyEdited(true);
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormError("");
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isSlugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: slugify(val),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanName = formData.name.trim();
    const cleanSlug = formData.slug.trim() || slugify(cleanName);

    if (!cleanName) {
      setFormError("Category Name is required.");
      return;
    }

    if (!cleanSlug) {
      setFormError("Category Slug is required.");
      return;
    }

    const payload = {
      name: cleanName,
      slug: cleanSlug,
      description: formData.description.trim(),
      image: formData.image.trim(),
      order: Number(formData.order) || 1,
      active: Boolean(formData.active),
    };

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      toast.success("Category saved", { id: "category" });
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save category:", err);
      const msg = "Failed to save category. Please try again.";
      setFormError(msg);
      toast.error(msg, { id: "category" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    if (!confirm(`Delete this category?${name ? ` ("${name}")` : ""}`)) return;
    try {
      await deleteCategory(id);
      toast("Category deleted", { icon: "🗑️", id: "category" });
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast.error("Failed to delete category", { id: "category" });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateCategory(id, { active: !currentActive });
      toast.success("Status updated", { id: "category" });
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status", { id: "category" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-taupe font-medium tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-taupe/70 mt-1">Manage product categories</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-taupe text-cream px-4 py-2.5 rounded-md hover:bg-gold transition-colors font-medium text-sm flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-taupe space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="font-serif text-base">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center bg-cream border border-sand rounded-md space-y-4">
          <p className="font-serif text-lg text-taupe">No categories yet</p>
          <p className="text-xs text-taupe/60 max-w-sm mx-auto">
            Get started by creating your first product category for customers to browse.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-taupe text-cream px-5 py-2.5 rounded-md hover:bg-gold transition text-sm font-medium shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-cream border border-sand rounded-md p-4 mb-3 shadow-2xs flex items-center gap-4 hover:border-gold/50 transition-colors"
            >
              {/* Drag Grip Indicator */}
              <div className="text-taupe/30 hidden sm:block">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Left: Thumbnail or Initial Letter Fallback */}
              <div className="w-16 h-16 rounded-md overflow-hidden bg-sand/40 border border-sand/60 shrink-0 flex items-center justify-center relative">
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-taupe/60 uppercase select-none">
                    {cat.name ? cat.name.charAt(0) : "C"}
                  </span>
                )}
              </div>

              {/* Middle: Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-taupe text-base truncate">
                    {cat.name}
                  </h3>
                  {cat.active === false && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-taupe/60 font-mono mt-0.5 truncate">
                  /{cat.slug}
                </p>
                {cat.description && (
                  <p className="text-xs text-taupe/70 mt-1 line-clamp-1">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* Order Badge */}
                <div
                  className="w-8 h-8 bg-beige border border-sand/60 rounded flex items-center justify-center text-xs font-semibold text-taupe select-none"
                  title="Display Order"
                >
                  {cat.order ?? "—"}
                </div>

                {/* Active Toggle Checkbox */}
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-taupe select-none">
                  <input
                    type="checkbox"
                    checked={cat.active !== false}
                    onChange={() => handleToggleActive(cat.id, cat.active !== false)}
                    className="w-4 h-4 rounded text-taupe focus:ring-gold accent-[#6B5B4E] cursor-pointer"
                  />
                  <span className="hidden sm:inline">Active</span>
                </label>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-taupe/60 hover:text-taupe hover:bg-beige rounded transition cursor-pointer"
                  title="Edit Category"
                  aria-label="Edit Category"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-taupe/60 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                  title="Delete Category"
                  aria-label="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {showModal && (
        <div
          className="fixed inset-0 bg-taupe/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-cream rounded-lg p-6 max-w-lg w-full border border-sand shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <h2 className="font-serif text-xl text-taupe font-medium">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-taupe/60 hover:text-taupe transition p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Khimar"
                  required
                  className="w-full bg-white border border-sand rounded px-3 py-2 text-sm text-taupe focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center bg-white border border-sand rounded px-3 py-2 focus-within:border-gold transition-colors">
                  <span className="text-taupe/40 text-xs font-mono select-none">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="khimar"
                    required
                    className="w-full text-sm text-taupe font-mono focus:outline-none ml-1"
                  />
                </div>
                <p className="text-[11px] text-taupe/50 mt-1 font-sans">
                  Auto-generated from name. Lowercase alphanumeric and hyphens.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="e.g. Elegant everyday khimar"
                  className="w-full bg-white border border-sand rounded px-3 py-2 text-sm text-taupe focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
                  Category Image
                </label>
                <ImageUploader
                  value={formData.image ? [formData.image] : []}
                  onChange={(urls) =>
                    setFormData((prev) => ({ ...prev, image: urls[0] || "" }))
                  }
                  maxImages={1}
                />
                <p className="text-[11px] text-taupe/50 mt-1">
                  Square or 3:4 portrait orientation recommended.
                </p>
              </div>

              {/* Row: Display Order + Active Toggle */}
              <div className="grid grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    min={1}
                    className="w-full bg-white border border-sand rounded px-3 py-2 text-sm text-taupe focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, active: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-taupe focus:ring-gold accent-[#6B5B4E] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-taupe">Active</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-taupe border border-sand rounded hover:bg-sand/30 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-medium bg-taupe text-cream hover:bg-gold rounded transition flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
