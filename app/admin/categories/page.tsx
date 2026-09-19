"use client";

import React, { useState, useEffect } from "react";
import {
  listenCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/categories-firestore";
import ImageUploader from "@/components/ImageUploader";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [order, setOrder] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);
  const [isSlugTouched, setIsSlugTouched] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = listenCategories((cats) => {
      setCategories(cats);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImages([]);
    setOrder(0);
    setActive(true);
    setIsSlugTouched(false);
    setEditingCategory(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEdit = (category: any) => {
    setEditingCategory(category);
    setName(category.name || "");
    setSlug(category.slug || "");
    setDescription(category.description || "");
    setImages(category.image ? [category.image] : []);
    setOrder(typeof category.order === "number" ? category.order : 0);
    setActive(category.active !== false);
    setIsSlugTouched(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugTouched) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugTouched(true);
    setSlug(e.target.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    const finalSlug = (slug.trim() || generateSlug(trimmedName)).trim();
    if (!finalSlug) {
      toast.error("Category slug is required");
      return;
    }

    const data = {
      name: trimmedName,
      slug: finalSlug,
      description: description.trim(),
      image: images[0] || "",
      order: Number(order) || 0,
      active,
    };

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      toast.success("Category saved");
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    try {
      await deleteCategory(id);
      toast("Category deleted", { icon: "🗑️" });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateCategory(id, { active: !currentActive });
      toast.success("Status updated");
    } catch (error) {
      console.error("Error updating category status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-taupe">Categories</h1>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-taupe text-cream px-4 py-2 rounded-md hover:bg-gold transition-colors font-medium text-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Category</span>
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16 font-serif text-lg text-taupe">
          Loading...
        </div>
      ) : categories.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-cream border border-sand rounded-md p-8 shadow-xs">
          <p className="font-serif text-lg text-taupe mb-4">No categories yet</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-taupe text-cream px-4 py-2 rounded-md hover:bg-gold transition-colors font-medium text-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Category</span>
          </button>
        </div>
      ) : (
        /* Category List */
        <div>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-cream border border-sand rounded-md p-4 mb-3 flex items-center gap-4 hover:border-gold/50 transition-colors shadow-xs"
            >
              {/* Left: Thumbnail or Initial letter fallback */}
              <div className="w-16 h-16 rounded-md object-cover bg-sand flex items-center justify-center shrink-0 overflow-hidden">
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-16 h-16 rounded-md object-cover bg-sand"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-taupe/60 uppercase select-none">
                    {cat.name ? cat.name.charAt(0) : "C"}
                  </span>
                )}
              </div>

              {/* Middle: Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-taupe truncate">{cat.name}</h3>
                <p className="text-xs text-taupe/60 font-mono truncate">
                  /{cat.slug}
                </p>
                {cat.description && (
                  <p className="text-xs text-taupe/60 mt-0.5 line-clamp-1">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Order number badge */}
                <div
                  className="w-8 h-8 bg-beige rounded flex items-center justify-center text-xs font-medium text-taupe"
                  title="Display Order"
                >
                  {cat.order ?? 0}
                </div>

                {/* Active toggle */}
                <label
                  className="flex items-center cursor-pointer p-1"
                  title="Toggle active status"
                >
                  <input
                    type="checkbox"
                    checked={cat.active !== false}
                    onChange={() =>
                      handleToggleActive(cat.id, cat.active !== false)
                    }
                    className="w-4 h-4 rounded text-taupe focus:ring-gold accent-[#6B5B4E] cursor-pointer"
                  />
                </label>

                {/* Edit button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-taupe hover:text-gold transition-colors cursor-pointer rounded"
                  title="Edit category"
                  aria-label="Edit category"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 transition-colors cursor-pointer rounded"
                  title="Delete category"
                  aria-label="Delete category"
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
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-cream rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-sand shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-taupe">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-taupe/60 hover:text-taupe transition-colors p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-taupe mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Khimar"
                  required
                  className="w-full bg-white border border-sand rounded-md px-3 py-2 text-sm text-taupe placeholder:text-taupe/40 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-taupe mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="khimar"
                  required
                  className="w-full bg-white border border-sand rounded-md px-3 py-2 text-sm text-taupe font-mono placeholder:text-taupe/40 focus:outline-none focus:border-gold transition-colors"
                />
                <p className="text-[11px] text-taupe/60 mt-1">
                  Auto-generated from name if left empty.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-taupe mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elegant everyday khimar"
                  className="w-full bg-white border border-sand rounded-md px-3 py-2 text-sm text-taupe placeholder:text-taupe/40 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-xs font-semibold text-taupe mb-1.5">
                  Category Image
                </label>
                <ImageUploader
                  value={images}
                  onChange={setImages}
                  maxImages={1}
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-semibold text-taupe mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-white border border-sand rounded-md px-3 py-2 text-sm text-taupe focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-taupe focus:ring-gold accent-[#6B5B4E] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-taupe">Active</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6 pt-2 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="border border-sand text-taupe px-4 py-2 rounded-md hover:bg-sand/30 transition-colors text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-taupe text-cream px-4 py-2 rounded-md hover:bg-gold transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
