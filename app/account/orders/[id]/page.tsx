"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import {
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Check,
  ChevronLeft,
  MessageCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { Order, updateOrderStatus } from "@/lib/orders-firestore";
import { BRAND } from "@/lib/constants";
import toast from "react-hot-toast";

const STEP_LABELS = ["Placed", "Confirmed", "Shipped", "Delivered"];

function getStepIndex(status: string = "PENDING"): number {
  const s = status.toUpperCase();
  if (s === "DELIVERED") return 3;
  if (s === "SHIPPED") return 2;
  if (s === "CONFIRMED") return 1;
  return 0; // PENDING
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = (params?.id as string) || "";
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Real-time listener for order data
  useEffect(() => {
    if (!user || !orderId) return;

    const docRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          router.push("/account");
          return;
        }

        const data = { id: docSnap.id, ...docSnap.data() } as Order;

        // Ensure current user owns this order
        if (data.userId && data.userId !== user.uid) {
          router.push("/account");
          return;
        }

        setOrder(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching order details:", err);
        router.push("/account");
      }
    );

    return () => unsubscribe();
  }, [user, orderId, router]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (confirm("Cancel this order?")) {
      try {
        setCancelling(true);
        await updateOrderStatus(order.id, "CANCELLED");
        toast.success("Order cancelled", { id: "order-cancel" });
      } catch (err) {
        console.error("Failed to cancel order:", err);
        toast.error("Failed to cancel order. Please try again.", { id: "order-cancel" });
      } finally {
        setCancelling(false);
      }
    }
  };

  const formatFullDate = (createdAt: unknown) => {
    if (!createdAt) return "Recent";
    const ts = createdAt as { toDate?: () => Date; seconds?: number } | null;
    let date: Date | null = null;
    if (typeof ts === "object" && ts !== null) {
      if (typeof ts.toDate === "function") date = ts.toDate();
      else if (typeof ts.seconds === "number") date = new Date(ts.seconds * 1000);
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === "string" || typeof createdAt === "number") {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) date = d;
    }
    if (!date) return "Recent";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || "PENDING").toUpperCase();
    switch (s) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Order Placed — Awaiting Confirmation</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-900 border border-blue-300">
            <CheckCircle className="w-4 h-4 text-blue-700" />
            <span>Confirmed — Being Prepared</span>
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-900 border border-purple-300">
            <Truck className="w-4 h-4 text-purple-700" />
            <span>Shipped — On the way</span>
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-900 border border-emerald-300">
            <PackageCheck className="w-4 h-4 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-900 border border-red-300">
            <XCircle className="w-4 h-4 text-red-700" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Order Placed — Awaiting Confirmation</span>
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-taupe">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
          <p className="font-serif text-xl text-taupe">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  const shortId = order.id.slice(-6).toUpperCase();
  const status = (order.status || "PENDING").toUpperCase();
  const isCancelled = status === "CANCELLED";
  const currentStep = getStepIndex(status);

  // Financial calculations
  const items = order.items || [];
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );
  const subtotal = itemsSubtotal > 0 ? itemsSubtotal : (order.total || 0);
  const isFreeShipping = subtotal >= 1999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const isCOD = order.paymentMethod === "COD" || !order.paymentMethod;
  const codFee = isCOD ? 49 : 0;
  const totalAmount = order.total || subtotal + shippingFee + codFee;

  const whatsappMessage = encodeURIComponent(
    `Hi ${BRAND.name}, I need help with my order #ALS${shortId}`
  );
  const whatsappUrl = `https://wa.me/${BRAND.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-taupe">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 sm:py-12 w-full">
        {/* 1. Back Link */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-taupe hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
        </div>

        {/* 2. Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-taupe font-medium">
            Order #ALS{shortId}
          </h1>
          <p className="text-sm text-taupe/60 mt-1">
            Placed on {formatFullDate(order.createdAt)}
          </p>
        </div>

        {/* 3. Status Badge */}
        <div className="mb-8">{renderStatusBadge(status)}</div>

        {/* 4. Progress Tracker (full width, py-8) */}
        {!isCancelled && (
          <div className="bg-cream border border-sand rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
            <div className="flex items-center justify-between w-full">
              {STEP_LABELS.map((label, idx) => {
                const isCompleted = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isCompleted
                            ? "bg-taupe text-cream shadow-xs"
                            : isCurrent
                            ? "bg-gold text-cream ring-4 ring-gold/25 shadow-xs"
                            : "bg-cream border-2 border-sand text-taupe/40"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs uppercase tracking-wider mt-2.5 text-center font-medium ${
                          isCompleted || isCurrent
                            ? "text-taupe font-semibold"
                            : "text-taupe/50"
                        }`}
                      >
                        {label}
                      </span>
                    </div>

                    {idx < STEP_LABELS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 sm:mx-4 -mt-6 ${
                          idx < currentStep ? "bg-taupe" : "bg-sand"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Cancelled Alert Box */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-3 text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium">This order was cancelled.</p>
          </div>
        )}

        {/* 6. Order Items Section */}
        <section className="mt-8">
          <h2 className="font-serif text-xl text-taupe mb-4 font-medium">
            Order Items
          </h2>
          <div className="space-y-3">
            {items.map((item, idx) => {
              const productUrl = `/product/${item.productId}`;

              return (
                <div
                  key={idx}
                  className="bg-beige p-4 rounded-md flex gap-4 items-center border border-sand/40"
                >
                  {/* Thumbnail */}
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded bg-sand flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded bg-sand/60 flex items-center justify-center text-xs text-taupe/50 flex-shrink-0">
                      No Img
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={productUrl}
                      className="font-serif text-base sm:text-lg text-taupe font-medium hover:text-gold transition truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-taupe/70 mt-1">
                      {item.size} • {item.color}
                    </p>
                    <p className="text-xs text-taupe/70 mt-0.5">
                      Qty: <span className="font-medium text-taupe">{item.qty}</span>
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-sm sm:text-base font-semibold text-taupe pl-2 flex-shrink-0">
                    ₹{((item.price || 0) * (item.qty || 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Delivery Address Section */}
        {order.address && (
          <section className="mt-8">
            <h2 className="font-serif text-xl text-taupe mb-4 font-medium">
              Delivery Address
            </h2>
            <div className="bg-beige p-4 rounded-md border border-sand/40 text-sm text-taupe space-y-1">
              <p className="font-medium text-base text-taupe">
                {order.address.fullName}
              </p>
              <p className="text-xs text-taupe/80">
                Phone: +91 {order.address.phone}
                {order.address.altPhone && ` • Alt: +91 ${order.address.altPhone}`}
              </p>
              <p className="text-xs text-taupe/80 pt-1 whitespace-pre-line">
                {order.address.address || (
                  <>
                    {order.address.line1}
                    {order.address.line2 && `, ${order.address.line2}`}
                  </>
                )}
              </p>
              {!order.address.address && order.address.landmark && (
                <p className="text-xs text-taupe/70">
                  Landmark: {order.address.landmark}
                </p>
              )}
              <p className="text-xs font-medium text-taupe">
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
              {order.address.notes && (
                <p className="text-xs text-taupe/70 italic pt-2 border-t border-sand/30 mt-2">
                  Notes: &ldquo;{order.address.notes}&rdquo;
                </p>
              )}
            </div>
          </section>
        )}

        {/* 8. Payment Summary Section */}
        <section className="mt-8">
          <h2 className="font-serif text-xl text-taupe mb-4 font-medium">
            Payment Summary
          </h2>
          <div className="bg-beige p-4 rounded-md border border-sand/40 space-y-2.5 text-sm text-taupe/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-taupe">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span
                className={`font-medium ${
                  isFreeShipping ? "text-emerald-700" : "text-taupe"
                }`}
              >
                {isFreeShipping ? "FREE" : `₹${shippingFee}`}
              </span>
            </div>

            {isCOD && (
              <div className="flex justify-between">
                <span>COD Charges</span>
                <span className="font-medium text-taupe">₹{codFee}</span>
              </div>
            )}

            <div className="border-t border-sand pt-2.5 flex justify-between items-baseline text-taupe">
              <span className="font-semibold text-base">Total</span>
              <span className="font-serif text-xl font-bold text-taupe">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* 9. Payment Method */}
          <p className="text-xs text-taupe/70 mt-2 px-1">
            Payment Method:{" "}
            <span className="font-medium text-taupe">
              {isCOD ? "Cash on Delivery (COD)" : "Online Payment"}
            </span>
          </p>
        </section>

        {/* 10. Bottom Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-taupe text-cream px-6 py-3 rounded-md flex items-center gap-2 hover:bg-gold transition font-medium text-sm shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Need Help? WhatsApp Us</span>
          </a>

          {status === "PENDING" && (
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="border border-red-300 text-red-600 px-6 py-3 rounded-md hover:bg-red-50 transition font-medium text-sm disabled:opacity-50 cursor-pointer"
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
