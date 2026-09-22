"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ChevronLeft, ChevronDown, ChevronUp, Tag, X } from "lucide-react";
import { increment } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PremiumButton from "@/components/PremiumButton";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { createOrder } from "@/lib/orders-firestore";
import { validateCoupon, updateCoupon } from "@/lib/coupons-firestore";
import toast from "react-hot-toast";
import {
  SavedAddress,
  INDIAN_STATES,
  subscribeUserAddresses,
  saveAddress,
} from "@/lib/addresses-firestore";
import {
  defaultSettings,
  listenStoreSettings,
  StoreSettings,
} from "@/lib/settings-firestore";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [modifiedFromId, setModifiedFromId] = useState<string | null>(null);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Form State (6 required fields only)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Check if currently entered address is a new one (not matching selected saved address)
  const isNewAddress =
    selectedAddressId === "new" ||
    !savedAddresses.some((a) => a.id === selectedAddressId);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = listenStoreSettings((data) => {
      setSettings(data);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to saved addresses if user is logged in
  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      return;
    }
    const unsubscribe = subscribeUserAddresses(user.uid, (list) => {
      setSavedAddresses(list);
      // Auto-select default or first address initially if none selected yet
      if (list.length > 0 && !selectedAddressId) {
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setSelectedAddressId(def.id);
          setFullName(def.fullName);
          setPhone(def.phone);
          setAddress(def.address);
          setCity(def.city);
          setState(def.state);
          setPincode(def.pincode);
        }
      }
    });
    return () => unsubscribe();
  }, [user, selectedAddressId]);

  // Cart Guard: redirect if empty once mounted
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/cart");
    }
  }, [mounted, items, router]);

  // Pre-fill user details if logged in (fallback if no saved addresses)
  useEffect(() => {
    if (user?.displayName && !fullName && savedAddresses.length === 0) {
      setFullName(user.displayName);
    }
    if (user?.phoneNumber && !phone && savedAddresses.length === 0) {
      const clean = user.phoneNumber.replace(/\+91|\D/g, "");
      setPhone(clean);
    }
  }, [user, fullName, phone, savedAddresses]);

  const subtotal = totalPrice();
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const isFreeShipping = subtotal >= settings.freeShippingAbove;
  const shippingFee = isFreeShipping ? 0 : settings.shippingCharge;
  const codFee = settings.codCharge;
  const total = Math.max(0, subtotal - couponDiscount) + shippingFee + codFee;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      const err = "Please enter a coupon code";
      setCouponError(err);
      toast.error(err, { id: "coupon" });
      return;
    }
    setCouponLoading(true);
    setCouponError("");

    const result = await validateCoupon(couponCode, subtotal);

    if (!result.valid || !result.coupon) {
      const err = result.error || "Invalid coupon";
      setCouponError(err);
      setAppliedCoupon(null);
      toast.error(err, { id: "coupon" });
    } else {
      const discount = result.discount ?? 0;
      setAppliedCoupon({ ...result.coupon, discount });
      setCouponError("");
      toast.success(`Coupon applied! You saved ₹${discount}`, { id: "coupon" });
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!address.trim()) {
      newErrors.address = "Full address is required";
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    if (!state.trim()) {
      newErrors.state = "Please select your state";
    }

    const cleanPincode = pincode.replace(/\D/g, "");
    if (!cleanPincode) {
      newErrors.pincode = "Pincode is required";
    } else if (cleanPincode.length !== 6) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(value);
    // If user modifies a field, deselect the saved address radio
    if (selectedAddressId && selectedAddressId !== "new") {
      setModifiedFromId(selectedAddressId);
      setSelectedAddressId("new");
    }
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setModifiedFromId(null);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddress(addr.address);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setErrors({});
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId("new");
    setModifiedFromId(null);
    setFullName(user?.displayName || "");
    const cleanPhone = user?.phoneNumber
      ? user.phoneNumber.replace(/\+91|\D/g, "")
      : "";
    setPhone(cleanPhone);
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate form first
    if (!validate()) {
      const firstErrorEl = document.querySelector("[data-error='true']");
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    // 2. Build WhatsApp message
    const orderRef = `ALS-${Date.now().toString(36).toUpperCase()}`;
    const shippingStr = isFreeShipping ? "FREE" : `₹${shippingFee}`;
    const codCharges = codFee;
    const couponLine = appliedCoupon
      ? `*Coupon (${appliedCoupon.code}):* -₹${appliedCoupon.discount}\n`
      : "";

    const message = `🛍️ *NEW ORDER — ALSayyedah*

*Order Ref:* ${orderRef}

*Items:*
${items.map((i) => `• ${i.name} (${i.size}, ${i.color}) x${i.qty} = ₹${i.price * i.qty}`).join("\n")}

*Subtotal:* ₹${subtotal}
${couponLine}*Shipping:* ${shippingStr}
*COD Charges:* ₹${codCharges}
*Total:* ₹${total}
*Payment:* Cash on Delivery

*Delivery Address:*
${fullName.trim()}
${address.trim()}
${city.trim()}, ${state.trim()} - ${pincode.replace(/\D/g, "")}
📞 ${phone.replace(/\D/g, "")}

Please confirm my order. Shukriya! 🙏`;

    const waNumber = settings.whatsappNumber
      ? settings.whatsappNumber.replace(/[^0-9]/g, "")
      : "919925837795";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    // 3. Open WhatsApp IMMEDIATELY (fresh user gesture — before any await)
    window.open(waUrl, "_blank");

    // 4. Save to Firestore in background (no await — fire and forget)
    createOrder({
      userId: user?.uid || null,
      customerName: fullName.trim(),
      customerPhone: phone.replace(/\D/g, ""),
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty,
        size: i.size,
        color: i.color,
        image: i.image,
      })),
      subtotal,
      shipping: shippingFee,
      codCharges,
      freeShippingThreshold: settings.freeShippingAbove,
      total,
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discount: appliedCoupon.discount,
          }
        : null,
      paymentMethod: "COD",
      address: {
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ""),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.replace(/\D/g, ""),
      },
      orderRef,
    }).catch((err: unknown) => console.error("Background order save failed:", err));

    // 4a. Update coupon usage count if coupon applied
    if (appliedCoupon?.id) {
      try {
        updateCoupon(appliedCoupon.id, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          usedCount: increment(1) as any,
        }).catch((err) =>
          console.error("Failed to increment coupon usedCount:", err)
        );
      } catch (err) {
        console.error("Failed to update coupon usage:", err);
      }
    }

    // 4b. Save to saved addresses if user is logged in, used a NEW address, and checked the box
    if (user && isNewAddress && saveAddressForFuture) {
      saveAddress(user.uid, {
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ""),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.replace(/\D/g, ""),
        isDefault: savedAddresses.length === 0,
      }).catch((err) => console.error("Background save address failed:", err));
    }

    // 5. Clear cart
    clearCart();

    // 6. Redirect to success page
    setTimeout(() => {
      router.push("/order-success");
    }, 500);
  };

  if (!mounted || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-taupe/60" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 pb-28 lg:pb-12 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-taupe/70 hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Cart</span>
          </Link>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-taupe mb-6 sm:mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          {/* Mobile Collapsible Order Summary Accordion (lg:hidden) */}
          <div className="lg:hidden mb-6 border border-sand rounded-lg overflow-hidden bg-beige/60">
            <button
              type="button"
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-medium text-taupe bg-beige border-b border-sand/40 cursor-pointer min-h-[44px]"
              aria-expanded={showMobileSummary}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🛍️</span>
                <span>{showMobileSummary ? "Hide Order Summary" : "Show Order Summary"}</span>
                {showMobileSummary ? (
                  <ChevronUp className="w-4 h-4 text-taupe/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-taupe/60" />
                )}
              </div>
              <span className="font-serif text-base font-bold text-taupe">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </button>

            {showMobileSummary && (
              <div className="p-4 space-y-3 bg-cream/80">
                <div className="max-h-48 overflow-y-auto space-y-2.5 divide-y divide-sand/40 pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="pt-2 first:pt-0 flex items-center gap-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded bg-sand/30 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-serif text-taupe font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-taupe/60 text-[11px] mt-0.5">
                          {item.size} • {item.color} • Qty: {item.qty}
                        </p>
                        <p className="font-semibold text-taupe mt-0.5">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-sand/60 pt-3 space-y-1.5 text-xs text-taupe/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-taupe">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={`font-medium ${isFreeShipping ? "text-emerald-700" : "text-taupe"}`}>
                      {isFreeShipping ? "FREE" : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>COD Charges</span>
                    <span className="font-medium text-taupe">₹{codFee}</span>
                  </div>
                  <div className="border-t border-sand pt-2 flex justify-between items-baseline font-semibold text-sm text-taupe">
                    <span>Total Amount</span>
                    <span className="font-serif text-lg text-taupe">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* LEFT COLUMN: Delivery Address Form (lg:col-span-2) */}
            <div className="lg:col-span-2 bg-cream rounded-lg space-y-6">
              <div className="border-b border-sand/60 pb-4">
                <h2 className="font-serif text-2xl text-taupe font-medium">
                  Delivery Address
                </h2>
                <p className="text-xs text-taupe/60 mt-1">
                  Please enter your complete delivery details to ensure swift courier delivery.
                </p>
              </div>

              {/* Select from Saved Addresses (radio-style cards) */}
              {user && savedAddresses.length > 0 && (
                <div className="bg-beige border border-sand rounded-md p-4 mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-taupe">
                      Saved Addresses
                    </label>
                    <span className="text-xs text-taupe/60">
                      Select one to auto-fill or enter a new address
                    </span>
                  </div>

                  <div className="space-y-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      const firstLine = addr.address.split("\n")[0] || addr.address;

                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`border rounded-md p-3 cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? "border-taupe bg-cream ring-1 ring-taupe shadow-2xs"
                              : "border-sand/70 bg-cream/70 hover:border-gold"
                          }`}
                        >
                          <div className="pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-taupe bg-taupe"
                                  : "border-sand bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-cream" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 text-xs space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-taupe text-sm">
                                {addr.fullName}
                              </span>
                              <span className="text-taupe/40">•</span>
                              <span className="text-taupe/80 font-mono">
                                +91 {addr.phone}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-gold text-cream font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-auto">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p className="text-taupe/70 truncate">
                              {firstLine}
                              {addr.city ? `, ${addr.city}` : ""}
                              {addr.pincode ? ` (${addr.pincode})` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Option: Enter new address manually */}
                    <div
                      onClick={handleSelectNewAddress}
                      className={`border rounded-md p-3 cursor-pointer transition-all flex items-center gap-3 ${
                        selectedAddressId === "new"
                          ? "border-taupe bg-cream ring-1 ring-taupe shadow-2xs"
                          : "border-sand/70 bg-cream/70 hover:border-gold"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          selectedAddressId === "new"
                            ? "border-taupe bg-taupe"
                            : "border-sand bg-white"
                        }`}
                      >
                        {selectedAddressId === "new" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-cream" />
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-taupe text-sm">
                          Enter new address manually
                        </span>
                        <p className="text-taupe/60 text-[11px]">
                          Clear selection and type a new delivery address
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2" data-error={!!errors.fullName}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value, setFullName)
                    }
                    placeholder="e.g. Fatima Shaikh"
                    className={`w-full bg-beige/40 border rounded px-4 py-3 text-base sm:text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors min-h-[44px] ${
                      errors.fullName
                        ? "border-red-500 focus:border-red-600 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* 2. Phone */}
                <div className="sm:col-span-2" data-error={!!errors.phone}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
                    Phone Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm text-taupe/60 font-medium select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) =>
                        handleInputChange(
                          "phone",
                          e.target.value.replace(/\D/g, ""),
                          setPhone
                        )
                      }
                      placeholder="9876543210"
                      className={`w-full bg-beige/40 border rounded pl-14 pr-3.5 py-3 text-base sm:text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors min-h-[44px] ${
                        errors.phone
                          ? "border-red-500 focus:border-red-600 bg-red-50/20"
                          : "border-sand focus:border-gold"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* 3. Full Address */}
                <div className="sm:col-span-2" data-error={!!errors.address}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value, setAddress)
                    }
                    placeholder="House/Flat no., Building name, Street, Area, Landmark"
                    className={`w-full bg-beige/40 border rounded px-4 py-3 text-base sm:text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors resize-y ${
                      errors.address
                        ? "border-red-500 focus:border-red-600 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* 4. City */}
                <div data-error={!!errors.city}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) =>
                      handleInputChange("city", e.target.value, setCity)
                    }
                    placeholder="e.g. Mumbai"
                    className={`w-full bg-beige/40 border rounded px-4 py-3 text-base sm:text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors min-h-[44px] ${
                      errors.city
                        ? "border-red-500 focus:border-red-600 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                {/* 5. State */}
                <div data-error={!!errors.state}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) =>
                      handleInputChange("state", e.target.value, setState)
                    }
                    className={`w-full bg-beige/40 border rounded px-3.5 py-3 text-base sm:text-sm text-taupe focus:outline-none transition-colors cursor-pointer min-h-[44px] ${
                      errors.state
                        ? "border-red-500 focus:border-red-600 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-xs text-red-600 mt-1">{errors.state}</p>
                  )}
                </div>

                {/* 6. Pincode */}
                <div className="sm:col-span-2" data-error={!!errors.pincode}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe mb-1.5">
                    Pincode (6 digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) =>
                      handleInputChange(
                        "pincode",
                        e.target.value.replace(/\D/g, ""),
                        setPincode
                      )
                    }
                    placeholder="e.g. 400001"
                    className={`w-full bg-beige/40 border rounded px-4 py-3 text-base sm:text-sm text-taupe placeholder:text-taupe/40 focus:outline-none transition-colors min-h-[44px] ${
                      errors.pincode
                        ? "border-red-500 focus:border-red-600 bg-red-50/20"
                        : "border-sand focus:border-gold"
                    }`}
                  />
                  {errors.pincode && (
                    <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>
                  )}
                </div>

                {/* Save this address for future orders (if logged in and entering new address) */}
                {user && isNewAddress && (
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveAddressFuture"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      className="rounded border-sand text-gold focus:ring-gold cursor-pointer"
                    />
                    <label
                      htmlFor="saveAddressFuture"
                      className="text-xs text-taupe/80 cursor-pointer select-none font-medium"
                    >
                      Save this address for future orders
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary (lg:col-span-1, sticky top-8) */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <div className="bg-beige border border-sand rounded-lg p-6 space-y-5 shadow-xs">
                <h2 className="font-serif text-xl text-taupe pb-2 border-b border-sand/60">
                  Order Summary
                </h2>

                {/* Items List */}
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1 divide-y divide-sand/40">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="pt-3 first:pt-0 flex items-center gap-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded bg-sand/30 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-serif text-taupe font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-taupe/60 text-[11px] mt-0.5">
                          {item.size} • {item.color} • Qty: {item.qty}
                        </p>
                        <p className="font-semibold text-taupe mt-1">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section (above Subtotal) */}
                <div className="pt-3 border-t border-sand/60">
                  {!appliedCoupon ? (
                    <div className="bg-cream border border-sand rounded-md p-3 mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            if (couponError) setCouponError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          className="flex-1 bg-transparent border-none outline-none text-sm uppercase font-mono text-taupe placeholder:text-taupe/40 min-w-0"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="bg-taupe text-cream px-4 py-1.5 rounded-md text-xs hover:bg-gold transition-colors font-medium disabled:opacity-50 cursor-pointer flex-shrink-0"
                        >
                          {couponLoading ? "Checking..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-red-500 text-xs mt-2">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-green-800 text-sm">
                          <Tag className="w-4 h-4 text-green-700" />
                          <span>{appliedCoupon.code}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-green-700 hover:text-green-900 p-0.5 rounded cursor-pointer"
                          aria-label="Remove coupon"
                          title="Remove coupon"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs text-green-700 font-medium">
                          You saved ₹{appliedCoupon.discount.toLocaleString("en-IN")}!
                        </span>
                        <span className="text-green-700 font-semibold text-sm">
                          -₹{appliedCoupon.discount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-sand/60 pt-4 space-y-2 text-xs text-taupe/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-taupe">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span
                      className={`font-medium ${
                        isFreeShipping ? "text-emerald-700" : "text-taupe"
                      }`}
                    >
                      {isFreeShipping ? "FREE" : `₹${shippingFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>COD Charges</span>
                    <span className="font-medium text-taupe">₹{codFee}</span>
                  </div>

                  <div className="border-t border-sand pt-3 flex justify-between items-baseline text-taupe">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="font-serif text-xl font-bold text-taupe">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="border-t border-sand/60 pt-4 space-y-2.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe">
                    Payment Method
                  </label>

                  {/* COD Radio (Default & Active) */}
                  <label className="flex items-start gap-3 p-3 rounded-md bg-cream border border-gold/70 cursor-pointer transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked
                      readOnly
                      className="mt-0.5 accent-taupe cursor-pointer"
                    />
                    <div className="text-xs">
                      <p className="font-medium text-taupe">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-[11px] text-taupe/70 mt-0.5">
                        Pay ₹{total.toLocaleString("en-IN")} in cash upon delivery
                      </p>
                    </div>
                  </label>

                  {/* Online Payment Radio (Disabled) */}
                  <label className="flex items-start gap-3 p-3 rounded-md bg-sand/20 border border-sand/40 opacity-60 cursor-not-allowed">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      disabled
                      className="mt-0.5 cursor-not-allowed"
                    />
                    <div className="text-xs flex-1 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-taupe">
                          Online Payment
                        </p>
                        <p className="text-[11px] text-taupe/60 mt-0.5">
                          UPI, Cards, NetBanking
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-sand/60 rounded text-taupe font-medium uppercase tracking-wider">
                        Coming Soon
                      </span>
                    </div>
                  </label>
                </div>

                {/* Submit CTA */}
                <div className="pt-2 space-y-3">
                  <PremiumButton
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    size="md"
                    className="w-full py-3.5 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <span>Place Order</span>
                    )}
                  </PremiumButton>

                  <p className="text-[11px] text-center text-taupe/60 leading-tight">
                    By placing your order, you agree to ALSayyedah&apos;s Terms &amp; Conditions and Privacy Policy.
                  </p>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-taupe/70 pt-1">
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    <span>Safe &amp; Verified Delivery across India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Mobile Place Order Bar (lg:hidden) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-md border-t border-sand p-3 shadow-xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="max-w-md mx-auto flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-taupe/60 block leading-tight">Total (COD)</span>
                <span className="font-serif text-lg font-bold text-taupe">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-taupe text-cream py-3 px-5 rounded-md hover:bg-gold transition-colors font-medium text-sm flex items-center justify-center gap-2 min-h-[48px] cursor-pointer disabled:opacity-50 active:scale-95 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Place Order</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
