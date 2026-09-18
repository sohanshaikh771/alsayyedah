"use client";

import React, { useState, useEffect } from "react";
import { Plus, Copy, Check, Trash2, Pencil, Loader2, X } from "lucide-react";
import {
  listenCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Coupon,
} from "@/lib/coupons-firestore";

interface CouponFormData {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number;
  validFrom: string;
  validTill: string;
  active: boolean;
}

const getDefaultFormData = (): CouponFormData => {
  const today = new Date().toISOString().split("T")[0];
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const thirtyDaysLater = future.toISOString().split("T")[0];

  return {
    code: "",
    type: "percentage",
    value: 10,
    minOrder: 0,
    maxUses: 0,
    validFrom: today,
    validTill: thirtyDaysLater,
    active: true,
  };
};

function formatDisplayDate(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(getDefaultFormData());
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenCoupons((data) => {
      setCoupons(data);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData(getDefaultFormData());
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxUses: coupon.maxUses,
      validFrom: coupon.validFrom,
      validTill: coupon.validTill,
      active: coupon.active,
    });
    setError("");
    setShowModal(true);
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      alert("Failed to delete coupon. Please try again.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanCode = formData.code.toUpperCase().trim();
    if (!cleanCode) {
      setError("Please enter a coupon code");
      return;
    }

    if (formData.value <= 0) {
      setError("Please enter a discount value greater than 0");
      return;
    }

    if (formData.type === "percentage" && formData.value > 100) {
      setError("Percentage discount cannot exceed 100%");
      return;
    }

    if (!formData.validFrom || !formData.validTill) {
      setError("Please set both start and end validity dates");
      return;
    }

    if (formData.validFrom > formData.validTill) {
      setError("Valid Till date must be after Valid From date");
      return;
    }

    setSaving(true);
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, {
          code: cleanCode,
          type: formData.type,
          value: Number(formData.value),
          minOrder: Number(formData.minOrder) || 0,
          maxUses: Number(formData.maxUses) || 0,
          validFrom: formData.validFrom,
          validTill: formData.validTill,
          active: Boolean(formData.active),
        });
      } else {
        await createCoupon({
          code: cleanCode,
          type: formData.type,
          value: Number(formData.value),
          minOrder: Number(formData.minOrder) || 0,
          maxUses: Number(formData.maxUses) || 0,
          validFrom: formData.validFrom,
          validTill: formData.validTill,
          active: Boolean(formData.active),
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save coupon:", err);
      setError("Failed to save coupon. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-taupe tracking-wide">
            Coupons
          </h1>
          <p className="text-sm text-taupe/60 mt-1 font-sans">
            Manage promo codes, discounts, and order requirements
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-taupe text-cream px-4 py-2.5 rounded-md hover:bg-gold transition-colors font-medium text-sm flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-taupe space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="font-serif text-base">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-16 text-center bg-cream border border-sand rounded-md">
          <p className="font-serif text-lg text-taupe">No coupons yet</p>
          <p className="text-xs text-taupe/60 mt-1">
            Click "+ Create Coupon" to add your first promotional discount.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const isCopied = copiedId === coupon.id;
            const discountLabel =
              coupon.type === "percentage"
                ? `${coupon.value}% off`
                : `₹${coupon.value.toLocaleString("en-IN")} off`;

            return (
              <div
                key={coupon.id}
                className="bg-cream border border-sand rounded-md p-4 sm:p-5 shadow-2xs space-y-3"
              >
                {/* Top row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Code Badge */}
                    <span className="bg-gold/20 text-taupe px-3 py-1 rounded-md font-mono font-bold tracking-wider text-sm sm:text-base border border-gold/30">
                      {coupon.code}
                    </span>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code, coupon.id)}
                      className="p-1.5 rounded text-taupe/60 hover:text-taupe hover:bg-sand/40 transition-colors relative cursor-pointer"
                      title="Copy code"
                      aria-label="Copy coupon code"
                    >
                      {isCopied ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 font-medium font-sans">
                          <Check className="w-4 h-4 text-green-700" />
                          <span>Copied!</span>
                        </span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Active Badge */}
                    {coupon.active ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sand/60 text-taupe/70">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(coupon)}
                      className="p-1.5 text-taupe/70 hover:text-gold hover:bg-beige rounded transition-colors cursor-pointer"
                      title="Edit coupon"
                      aria-label="Edit coupon"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Delete coupon"
                      aria-label="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-sand/60 text-xs sm:text-sm font-sans">
                  <div>
                    <span className="text-taupe/60 block text-[11px] uppercase tracking-wider">
                      Discount
                    </span>
                    <span className="font-semibold text-taupe mt-0.5 block">
                      {discountLabel}
                    </span>
                  </div>

                  <div>
                    <span className="text-taupe/60 block text-[11px] uppercase tracking-wider">
                      Minimum Order
                    </span>
                    <span className="font-medium text-taupe mt-0.5 block">
                      {coupon.minOrder > 0
                        ? `₹${coupon.minOrder.toLocaleString("en-IN")}`
                        : "No minimum"}
                    </span>
                  </div>

                  <div>
                    <span className="text-taupe/60 block text-[11px] uppercase tracking-wider">
                      Usage
                    </span>
                    <span className="font-medium text-taupe mt-0.5 block">
                      Used: {coupon.usedCount || 0} /{" "}
                      {coupon.maxUses > 0 ? coupon.maxUses : "∞"}
                    </span>
                  </div>

                  <div>
                    <span className="text-taupe/60 block text-[11px] uppercase tracking-wider">
                      Validity
                    </span>
                    <span className="font-medium text-taupe mt-0.5 block truncate">
                      {formatDisplayDate(coupon.validFrom)} —{" "}
                      {formatDisplayDate(coupon.validTill)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cream rounded-lg border border-sand shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand">
              <h3 className="font-serif text-2xl text-taupe">
                {editingCoupon ? "Edit Coupon" : "Create Coupon"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-taupe/60 hover:text-taupe hover:bg-beige transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 font-sans text-sm">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {error}
                </div>
              )}

              {/* Coupon Code */}
              <div>
                <label className="font-medium text-taupe block mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. EID30"
                  className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe font-mono font-bold uppercase focus:border-gold focus:outline-none"
                  required
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="font-medium text-taupe block mb-1">
                  Discount Type *
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-taupe">
                    <input
                      type="radio"
                      name="discountType"
                      checked={formData.type === "percentage"}
                      onChange={() =>
                        setFormData({ ...formData, type: "percentage" })
                      }
                      className="accent-taupe"
                    />
                    <span>Percentage (%)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-taupe">
                    <input
                      type="radio"
                      name="discountType"
                      checked={formData.type === "fixed"}
                      onChange={() =>
                        setFormData({ ...formData, type: "fixed" })
                      }
                      className="accent-taupe"
                    />
                    <span>Fixed Amount (₹)</span>
                  </label>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="font-medium text-taupe block mb-1">
                  Discount Value * ({formData.type === "percentage" ? "%" : "₹"})
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.type === "percentage" ? "100" : undefined}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: Number(e.target.value),
                    })
                  }
                  className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none"
                  required
                />
              </div>

              {/* Minimum Order */}
              <div>
                <label className="font-medium text-taupe block mb-1">
                  Minimum Order (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrder: Number(e.target.value),
                    })
                  }
                  placeholder="0 for no minimum"
                  className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="font-medium text-taupe block mb-1">
                  Max Uses (0 = unlimited)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-taupe block mb-1">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-taupe block mb-1">
                    Valid Till *
                  </label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) =>
                      setFormData({ ...formData, validTill: e.target.value })
                    }
                    className="w-full bg-cream border border-sand rounded-md px-3 py-2 text-taupe focus:border-gold focus:outline-none text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Active Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-4 h-4 accent-taupe rounded"
                  />
                  <span className="font-medium text-taupe">Active</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-sand text-taupe rounded-md hover:bg-beige transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-taupe text-cream rounded-md hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs font-medium"
                >
                  {saving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
