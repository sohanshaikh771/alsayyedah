"use client";

import React, { useEffect, useState } from "react";
import {
  listenBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  Banner,
  BannerInput,
} from "@/lib/banners-firestore";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface BannerModalState {
  isOpen: boolean;
  isEditing: boolean;
  bannerId?: string;
  text: string;
  buttonText: string;
  link: string;
  bgColor: string;
  textColor: string;
  position: "top" | "hero";
  startDate: string;
  endDate: string;
  active: boolean;
}

const defaultModalState: BannerModalState = {
  isOpen: false,
  isEditing: false,
  text: "",
  buttonText: "",
  link: "/shop",
  bgColor: "#C9A96E",
  textColor: "#FFFFFF",
  position: "top",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  active: true,
};

const COLOR_PRESETS = [
  { label: "Brand Gold", bg: "#C9A96E", text: "#FFFFFF" },
  { label: "Taupe Velvet", bg: "#6B5B4E", text: "#FAF7F2" },
  { label: "Deep Onyx", bg: "#1A1A1A", text: "#FAF7F2" },
  { label: "Warm Sand", bg: "#E8DCC8", text: "#6B5B4E" },
  { label: "Burgundy Ruby", bg: "#801B2B", text: "#FFFFFF" },
  { label: "Emerald Oasis", bg: "#1B4D3E", text: "#FFFFFF" },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<BannerModalState>(defaultModalState);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Subscribe to real-time banners collection
  useEffect(() => {
    const unsubscribe = listenBanners((data) => {
      setBanners(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setFormError(null);
    setModalState({
      ...defaultModalState,
      isOpen: true,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
  };

  const handleOpenEdit = (banner: Banner) => {
    setFormError(null);
    // Format dates to YYYY-MM-DD for standard date input controls
    const sDate = banner.startDate ? banner.startDate.split("T")[0] : "";
    const eDate = banner.endDate ? banner.endDate.split("T")[0] : "";

    setModalState({
      isOpen: true,
      isEditing: true,
      bannerId: banner.id,
      text: banner.text,
      buttonText: banner.buttonText || "",
      link: banner.link,
      bgColor: banner.bgColor || "#C9A96E",
      textColor: banner.textColor || "#FFFFFF",
      position: banner.position || "top",
      startDate: sDate,
      endDate: eDate,
      active: banner.active,
    });
  };

  const handleCloseModal = () => {
    setModalState(defaultModalState);
    setFormError(null);
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      setTogglingId(banner.id);
      await updateBanner(banner.id, { active: !banner.active });
    } catch (err) {
      console.error("Failed to toggle banner active state:", err);
      alert("Failed to update status. Please check your admin privileges.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete banner:", err);
      alert("Failed to delete banner. Please check permissions.");
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalState.text.trim()) {
      setFormError("Banner text is required.");
      return;
    }
    if (!modalState.link.trim()) {
      setFormError("Banner link is required.");
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      // Store ISO string format or normalized YYYY-MM-DD
      const payload: BannerInput = {
        text: modalState.text.trim(),
        buttonText: modalState.buttonText.trim(),
        link: modalState.link.trim(),
        bgColor: modalState.bgColor,
        textColor: modalState.textColor,
        position: modalState.position,
        startDate: modalState.startDate ? new Date(modalState.startDate).toISOString() : "",
        endDate: modalState.endDate ? new Date(`${modalState.endDate}T23:59:59.999Z`).toISOString() : "",
        active: modalState.active,
      };

      if (modalState.isEditing && modalState.bannerId) {
        await updateBanner(modalState.bannerId, payload);
      } else {
        await createBanner(payload);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Error saving banner:", err);
      setFormError("Failed to save banner. Please check your network and admin permissions.");
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "Open ended";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand">
        <div>
          <h1 className="font-serif text-3xl text-taupe tracking-tight">Banners</h1>
          <p className="text-sm text-taupe/70 mt-1">
            Manage public promotional announcement bars and hero message strips across the store.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-taupe text-cream hover:bg-taupe/90 rounded-md font-medium text-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>+ Add Banner</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="font-serif text-taupe/80 text-base">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        /* Empty State */
        <div className="bg-cream border border-sand border-dashed rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-sand/30 text-taupe rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h3 className="font-serif text-xl text-taupe">No banners yet</h3>
            <p className="text-sm text-taupe/70 mt-1">
              Create your first promotional banner to announce sales, free shipping, or special collections.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-taupe text-cream hover:bg-taupe/90 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 text-gold" />
            <span>Create Banner</span>
          </button>
        </div>
      ) : (
        /* List of Banner Cards */
        <div className="space-y-4">
          {banners.map((banner) => {
            const isToggling = togglingId === banner.id;

            return (
              <div
                key={banner.id}
                className="bg-cream border border-sand rounded-md p-4 mb-3 shadow-xs hover:border-gold/50 transition-all duration-200"
              >
                {/* 1. Preview Strip at top */}
                <div
                  className="rounded-md px-4 py-2.5 mb-4 flex items-center justify-between text-xs sm:text-sm font-medium shadow-2xs overflow-hidden"
                  style={{
                    backgroundColor: banner.bgColor || "#C9A96E",
                    color: banner.textColor || "#FFFFFF",
                  }}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="truncate">{banner.text}</span>
                  </div>

                  {banner.buttonText && (
                    <span
                      className="ml-3 px-2.5 py-1 text-xs rounded font-semibold whitespace-nowrap opacity-95 transition-opacity"
                      style={{
                        backgroundColor:
                          banner.textColor === "#FFFFFF"
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.1)",
                        color: banner.textColor,
                      }}
                    >
                      {banner.buttonText} →
                    </span>
                  )}
                </div>

                {/* 2. Metadata & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          banner.position === "top"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-purple-100 text-purple-900 border border-purple-200"
                        }`}
                      >
                        {banner.position === "top" ? "TOP STRIP" : "HERO"}
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          banner.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {banner.active ? "Live" : "Inactive"}
                      </span>

                      <span className="font-medium text-taupe text-sm truncate">
                        {banner.text}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-taupe/75">
                      <div className="flex items-center space-x-1 truncate max-w-xs">
                        <ExternalLink className="w-3.5 h-3.5 text-taupe/50 flex-shrink-0" />
                        <span className="truncate">{banner.link}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-taupe/50 flex-shrink-0" />
                        <span>
                          {formatDateDisplay(banner.startDate)} — {formatDateDisplay(banner.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Active Toggle + Edit + Delete */}
                  <div className="flex items-center space-x-3 sm:space-x-4 self-end md:self-center">
                    {/* Active Toggle Switch */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-taupe/70 font-medium">Active</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={banner.active}
                        disabled={isToggling}
                        onClick={() => handleToggleActive(banner)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          banner.active ? "bg-emerald-600" : "bg-stone-300"
                        } ${isToggling ? "opacity-50 cursor-wait" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            banner.active ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 text-taupe/80 hover:text-taupe hover:bg-beige rounded-md transition-colors"
                      title="Edit banner"
                      aria-label="Edit banner"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    {deleteConfirmId === banner.id ? (
                      <div className="flex items-center space-x-1 bg-red-50 border border-red-200 p-1 rounded-md">
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 text-taupe/70 hover:text-taupe text-xs"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(banner.id)}
                        className="p-1.5 text-red-600/80 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete banner"
                        aria-label="Delete banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 3: Banner Add / Edit Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-taupe/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div
            className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-sand overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand bg-cream">
              <div>
                <h2 className="font-serif text-xl text-taupe font-medium">
                  {modalState.isEditing ? "Edit Banner" : "Add New Banner"}
                </h2>
                <p className="text-xs text-taupe/70 mt-0.5">
                  Configure banner design, schedule, and placement.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 text-taupe/60 hover:text-taupe hover:bg-beige rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center space-x-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Live Preview Box inside Modal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-taupe/70">
                  Live Preview
                </label>
                <div
                  className="rounded-md px-4 py-2.5 text-center text-xs sm:text-sm font-medium shadow-xs flex items-center justify-center space-x-2 transition-all duration-150"
                  style={{
                    backgroundColor: modalState.bgColor,
                    color: modalState.textColor,
                  }}
                >
                  <span>{modalState.text || "Sample Banner Announcement Text"}</span>
                  {modalState.buttonText && (
                    <span
                      className="px-2 py-0.5 text-xs rounded font-semibold opacity-90 underline underline-offset-2"
                      style={{
                        backgroundColor:
                          modalState.textColor === "#FFFFFF"
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(0,0,0,0.1)",
                      }}
                    >
                      {modalState.buttonText}
                    </span>
                  )}
                </div>
              </div>

              {/* 1. Banner Text * */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                  Banner Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Express Shipping across India on orders above ₹1,999"
                  value={modalState.text}
                  onChange={(e) => setModalState({ ...modalState, text: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-cream/40 border border-sand rounded-md text-taupe placeholder:text-taupe/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                />
              </div>

              {/* 2. Button Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    Button Text <span className="text-taupe/50 text-[11px] lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={modalState.buttonText}
                    onChange={(e) => setModalState({ ...modalState, buttonText: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cream/40 border border-sand rounded-md text-taupe placeholder:text-taupe/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /shop or /shop?c=abaya"
                    value={modalState.link}
                    onChange={(e) => setModalState({ ...modalState, link: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cream/40 border border-sand rounded-md text-taupe placeholder:text-taupe/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                  />
                </div>
              </div>

              {/* 3. Background Color & Text Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={modalState.bgColor}
                      onChange={(e) => setModalState({ ...modalState, bgColor: e.target.value })}
                      className="w-10 h-10 rounded border border-sand cursor-pointer p-0.5 bg-cream"
                    />
                    <input
                      type="text"
                      value={modalState.bgColor}
                      onChange={(e) => setModalState({ ...modalState, bgColor: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm font-mono uppercase bg-cream/40 border border-sand rounded-md text-taupe focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={modalState.textColor}
                      onChange={(e) => setModalState({ ...modalState, textColor: e.target.value })}
                      className="w-10 h-10 rounded border border-sand cursor-pointer p-0.5 bg-cream"
                    />
                    <input
                      type="text"
                      value={modalState.textColor}
                      onChange={(e) => setModalState({ ...modalState, textColor: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm font-mono uppercase bg-cream/40 border border-sand rounded-md text-taupe focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <span className="block text-[11px] font-medium text-taupe/70 mb-1.5">
                  Color Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setModalState({
                          ...modalState,
                          bgColor: preset.bg,
                          textColor: preset.text,
                        })
                      }
                      className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded border border-sand hover:border-gold transition-colors bg-white shadow-2xs"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-sand"
                        style={{ backgroundColor: preset.bg }}
                      />
                      <span className="text-taupe">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Position: Radio (Top Strip / Hero) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-2">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      modalState.position === "top"
                        ? "border-gold bg-beige/60 ring-1 ring-gold"
                        : "border-sand bg-cream/30 hover:bg-beige/30"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="position"
                        value="top"
                        checked={modalState.position === "top"}
                        onChange={() => setModalState({ ...modalState, position: "top" })}
                        className="text-gold focus:ring-gold"
                      />
                      <span className="text-sm font-medium text-taupe">Top Strip</span>
                    </div>
                    <span className="text-[11px] text-taupe/60">Above Navbar</span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      modalState.position === "hero"
                        ? "border-gold bg-beige/60 ring-1 ring-gold"
                        : "border-sand bg-cream/30 hover:bg-beige/30"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="position"
                        value="hero"
                        checked={modalState.position === "hero"}
                        onChange={() => setModalState({ ...modalState, position: "hero" })}
                        className="text-gold focus:ring-gold"
                      />
                      <span className="text-sm font-medium text-taupe">Hero</span>
                    </div>
                    <span className="text-[11px] text-taupe/60">Hero Area</span>
                  </label>
                </div>
              </div>

              {/* 5. Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={modalState.startDate}
                    onChange={(e) => setModalState({ ...modalState, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cream/40 border border-sand rounded-md text-taupe focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={modalState.endDate}
                    onChange={(e) => setModalState({ ...modalState, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-cream/40 border border-sand rounded-md text-taupe focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              {/* 6. Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-cream/50 rounded-lg border border-sand">
                <div>
                  <div className="text-sm font-medium text-taupe">Active Status</div>
                  <div className="text-xs text-taupe/70">
                    Enable this banner to show on the public storefront.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={modalState.active}
                  onClick={() => setModalState({ ...modalState, active: !modalState.active })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    modalState.active ? "bg-emerald-600" : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      modalState.active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sand">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-taupe/80 hover:text-taupe bg-beige/60 hover:bg-beige rounded-md transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-medium bg-taupe text-cream hover:bg-taupe/90 rounded-md transition-colors shadow-xs disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-gold" />
                      <span>Save Banner</span>
                    </>
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
